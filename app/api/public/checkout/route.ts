import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { consumeRequestLimit, isRecord, readJson, RequestInputError } from "@/lib/server/http";
import { getRuntimeEnv, mongoCommand } from "@/lib/server/mongo-store";

type CheckoutLine = { slug: string; quantity: number; option?: string };

function isCheckoutLine(value: unknown): value is CheckoutLine {
  return isRecord(value)
    && typeof value.slug === "string"
    && /^[a-z0-9][a-z0-9-]{0,119}$/.test(value.slug)
    && typeof value.quantity === "number"
    && Number.isInteger(value.quantity)
    && value.quantity >= 1
    && value.quantity <= 99
    && (value.option === undefined || (typeof value.option === "string" && value.option.length <= 120));
}

export async function POST(request: NextRequest) {
  const env = await getRuntimeEnv() as Record<string, string | undefined>;
  const secretKey = env.PAYSTACK_SECRET_KEY;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  if (!secretKey || !siteUrl) {
    return NextResponse.json({ error: "Secure checkout is not configured." }, { status: 503 });
  }

  try {
    if (!await consumeRequestLimit(request, "checkout-init", 5, 3600)) {
      return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
    }

    const body = await readJson(request, 16_000);
    if (!isRecord(body) || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 25
      || !body.items.every(isCheckoutLine)
      || !isRecord(body.delivery)
      || typeof body.fullName !== "string" || body.fullName.trim().length < 2 || body.fullName.length > 160
      || typeof body.email !== "string" || body.email.length > 254
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
      || typeof body.phone !== "string" || body.phone.trim().length < 6 || body.phone.length > 40
      || typeof body.delivery.state !== "string" || body.delivery.state.trim().length < 2 || body.delivery.state.length > 100
      || typeof body.delivery.address !== "string" || body.delivery.address.trim().length < 5 || body.delivery.address.length > 1000
      || (body.delivery.note !== undefined && (typeof body.delivery.note !== "string" || body.delivery.note.length > 1000))) {
      throw new RequestInputError("Check your contact and delivery details, then try again.");
    }

    const lines = body.items as CheckoutLine[];
    const slugs = [...new Set(lines.map((line) => line.slug))];
    const products = await mongoCommand<Array<{ slug: string; title: string; price: number; options?: unknown }>>({
      action: "find", collection: "products", filter: { slug: { $in: slugs }, visible: true },
      projection: { slug: 1, title: 1, price: 1, options: 1 }
    });
    if (products.length !== slugs.length) {
      throw new RequestInputError("One or more items in your cart are no longer available.", 409);
    }

    const normalizedItems: { slug: string; title: string; option: string | null; quantity: number; unit_price: number }[] = [];
    let totalNaira = 0;
    for (const line of lines) {
      const product = products.find((item) => item.slug === line.slug);
      if (!product) throw new RequestInputError("One or more items in your cart are no longer available.", 409);

      const options = Array.isArray(product.options) ? product.options : [];
      let unitPrice = Number(product.price);
      let optionLabel: string | null = null;
      if (options.length > 0) {
        const selected = options.find((option: unknown) => isRecord(option) && option.label === line.option);
        if (!selected || !isRecord(selected) || typeof selected.price !== "number" || !Number.isFinite(selected.price) || selected.price <= 0) {
          throw new RequestInputError(`Choose a valid option for ${product.title}.`);
        }
        unitPrice = selected.price;
        optionLabel = line.option ?? null;
      } else if (line.option) {
        throw new RequestInputError(`The selected option for ${product.title} is no longer available.`);
      }

      totalNaira += unitPrice * line.quantity;
      normalizedItems.push({
        slug: product.slug,
        title: product.title,
        option: optionLabel,
        quantity: line.quantity,
        unit_price: unitPrice
      });
    }

    const amountKobo = Math.round(totalNaira * 100);
    if (!Number.isSafeInteger(amountKobo) || amountKobo < 100 || amountKobo > 5_000_000_000) {
      throw new RequestInputError("The order total is outside the permitted checkout range.");
    }

    const reference = `COLGAR-${randomUUID()}`;
    const email = body.email.trim().toLowerCase();
    const now = new Date().toISOString();
    await mongoCommand({
      action: "adminMutation",
      mutation: {
        action: "insertOne",
        collection: "orders",
        document: {
          id: randomUUID(),
          reference,
          status: "pending",
          email,
          full_name: body.fullName.trim(),
          phone: body.phone.trim(),
          delivery_address: {
            state: body.delivery.state.trim(),
            address: body.delivery.address.trim(),
            note: typeof body.delivery.note === "string" ? body.delivery.note.trim() : ""
          },
          items: normalizedItems,
          amount_kobo: amountKobo,
          currency: "NGN",
          created_at: now,
          updated_at: now
        }
      },
      audit: {
        id: randomUUID(),
        entity: "orders",
        action: "created",
        detail: `Order ${reference} created.`,
        created_at: now
      }
    });

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency: "NGN",
        reference,
        callback_url: new URL("/api/public/payments/callback", siteUrl).toString(),
        metadata: { order_reference: reference }
      }),
      cache: "no-store"
    });
    const paystackResult = await paystackResponse.json().catch(() => null) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string; reference?: string };
    } | null;
    if (!paystackResponse.ok || !paystackResult?.status
      || paystackResult.data?.reference !== reference
      || typeof paystackResult.data.authorization_url !== "string") {
      try {
        await mongoCommand({
          action: "adminMutation",
          mutation: {
            action: "updateOne", collection: "orders", filter: { reference, status: "pending" },
            update: { $set: { status: "failed", updated_at: new Date().toISOString() } }
          },
          audit: {
            id: randomUUID(),
            entity: "orders",
            action: "updated",
            detail: `Order ${reference} marked failed.`,
            created_at: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error("Could not mark an uninitialized Colgar order as failed.", error);
      }
      console.error("Paystack rejected a Colgar checkout initialization.", paystackResponse.status, paystackResult?.message);
      return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ authorizationUrl: paystackResult.data.authorization_url }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    if (error instanceof RequestInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Colgar checkout initialization failed.", error);
    return NextResponse.json({ error: "Checkout could not be completed. Please try again." }, { status: 503 });
  }
}
