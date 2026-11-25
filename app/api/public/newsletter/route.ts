import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { isRecord, readJson, RequestInputError, consumeRequestLimit, escapeHtml } from "@/lib/server/http";
import { getRuntimeEnv, mongoCommand } from "@/lib/server/mongo-store";

export async function POST(request: NextRequest) {
  const env = await getRuntimeEnv() as Record<string, string | undefined>;
  const resendKey = env.RESEND_API_KEY;
  const from = env.NEWSLETTER_FROM;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  if (!resendKey || !from || !siteUrl) {
    return NextResponse.json({ error: "Newsletter signup is not configured." }, { status: 503 });
  }

  try {
    if (!await consumeRequestLimit(request, "newsletter-signup", 5, 3600)) {
      return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 });
    }

    const body = await readJson(request, 4_000);
    if (!isRecord(body) || typeof body.email !== "string" || body.email.length > 254 || body.consent !== true) {
      throw new RequestInputError("Enter your email and consent to receive Colgar updates.");
    }
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new RequestInputError("Enter a valid email address.");
    }

    const existing = await mongoCommand<{ id: string; status: string } | null>({
      action: "findOne", collection: "subscribers", filter: { email },
      projection: { id: 1, status: 1 }
    });
    if (existing?.status === "active") {
      return NextResponse.json({ message: "If this address can be subscribed, a confirmation email will arrive shortly." }, { status: 202 });
    }

    const subscriber = {
      id: existing?.id ?? randomUUID(),
      email,
      consent_at: new Date().toISOString(),
      status: "pending",
      confirmation_token: randomUUID(),
      unsubscribe_token: randomUUID(),
      updated_at: new Date().toISOString()
    };
    await mongoCommand({
      action: "updateOne", collection: "subscribers", filter: { email },
      update: {
        $set: subscriber,
        $setOnInsert: { created_at: new Date().toISOString() }
      },
      upsert: true
    });

    const confirmationUrl = new URL("/api/public/newsletter", siteUrl);
    confirmationUrl.searchParams.set("token", subscriber.confirmation_token);
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Confirm your Colgar Foundation updates",
        html: `<p>Thanks for asking to receive Colgar stories and updates.</p><p><a href="${confirmationUrl.toString()}">Confirm your subscription</a></p><p>If you did not request this, you can ignore this message.</p>`
      }),
      cache: "no-store"
    });
    if (!emailResponse.ok) {
      console.error("Resend rejected a Colgar subscription confirmation.", emailResponse.status);
      return NextResponse.json({ error: "We could not send the confirmation email. Please try again later." }, { status: 502 });
    }

    return NextResponse.json({ message: "Check your inbox to confirm your subscription." }, { status: 202 });
  } catch (error) {
    if (error instanceof RequestInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Colgar newsletter signup failed.", error);
    return NextResponse.json({ error: "Newsletter signup could not be completed." }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const env = await getRuntimeEnv() as Record<string, string | undefined>;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json({ error: "Newsletter confirmation is not configured." }, { status: 503 });
  }

  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    return NextResponse.redirect(new URL("/blog?subscription=invalid", siteUrl));
  }

  try {
    const result = await mongoCommand<{ matchedCount: number }>({
      action: "adminMutation",
      mutation: {
        action: "updateOne", collection: "subscribers",
        filter: { confirmation_token: token, status: "pending" },
        update: { $set: { status: "active", confirmation_token: randomUUID(), updated_at: new Date().toISOString() } }
      },
      audit: {
        id: randomUUID(),
        entity: "subscriber",
        action: "subscribed",
        detail: "A newsletter subscriber confirmed by email.",
        created_at: new Date().toISOString()
      }
    });
    if (!result.matchedCount) return NextResponse.redirect(new URL("/blog?subscription=invalid", siteUrl));
  } catch (error) {
    console.error("Could not confirm a Colgar newsletter subscriber.", error);
    return NextResponse.redirect(new URL("/blog?subscription=error", siteUrl));
  }
  return NextResponse.redirect(new URL("/blog?subscription=confirmed", siteUrl));
}

