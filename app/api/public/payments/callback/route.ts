import { NextResponse, type NextRequest } from "next/server";
import { verifyAndRecordPaystackPayment } from "@/lib/server/payments";
import { getRuntimeEnv } from "@/lib/server/mongo-store";

export async function GET(request: NextRequest) {
  const env = await getRuntimeEnv() as Record<string, string | undefined>;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json({ error: "Payment return is not configured." }, { status: 503 });
  }

  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref") ?? "";
  if (!/^COLGAR-[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reference)) {
    return NextResponse.redirect(new URL("/checkout?payment=failed", siteUrl));
  }

  try {
    const paid = await verifyAndRecordPaystackPayment(reference);
    return NextResponse.redirect(new URL(`/checkout?payment=${paid ? "success" : "failed"}`, siteUrl));
  } catch (error) {
    console.error("Could not verify a Colgar payment callback.", error);
    return NextResponse.redirect(new URL("/checkout?payment=failed", siteUrl));
  }
}
