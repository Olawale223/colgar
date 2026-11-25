import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { readRawBody } from "@/lib/server/http";
import { verifyAndRecordPaystackPayment } from "@/lib/server/payments";
import { getRuntimeEnv } from "@/lib/server/mongo-store";

export async function POST(request: NextRequest) {
  const env = await getRuntimeEnv() as Record<string, string | undefined>;
  const secretKey = env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payment notifications are not configured." }, { status: 503 });
  }

  try {
    const rawBody = await readRawBody(request, 64_000);
    const signature = request.headers.get("x-paystack-signature") ?? "";
    if (!/^[a-f0-9]{128}$/i.test(signature)) {
      return NextResponse.json({ error: "Invalid payment notification signature." }, { status: 401 });
    }
    const expected = createHmac("sha512", secretKey).update(rawBody).digest();
    const received = Buffer.from(signature, "hex");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return NextResponse.json({ error: "Invalid payment notification signature." }, { status: 401 });
    }

    let event: unknown;
    try {
      event = JSON.parse(rawBody) as unknown;
    } catch {
      return NextResponse.json({ error: "Payment notification body must be valid JSON." }, { status: 400 });
    }
    if (typeof event !== "object" || event === null || !("event" in event) || !("data" in event)) {
      return NextResponse.json({ error: "Payment notification body is not valid." }, { status: 400 });
    }

    const payload = event as { event: unknown; data: unknown };
    if (payload.event === "charge.success" && typeof payload.data === "object" && payload.data !== null
      && "reference" in payload.data && typeof payload.data.reference === "string"
      && /^COLGAR-[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.data.reference)) {
      await verifyAndRecordPaystackPayment(payload.data.reference);
    }

    return NextResponse.json({ received: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not process a Colgar payment notification.", error);
    const status = error instanceof Error && "status" in error && error.status === 413 ? 413 : 503;
    return NextResponse.json({ error: "Payment notification could not be processed." }, { status });
  }
}
