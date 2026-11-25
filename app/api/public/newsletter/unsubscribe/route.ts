import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { consumeRequestLimit, isRecord, readJson, RequestInputError } from "@/lib/server/http";
import { mongoCommand } from "@/lib/server/mongo-store";

export async function POST(request: NextRequest) {
  try {
    if (!await consumeRequestLimit(request, "newsletter-unsubscribe", 20, 3600)) {
      return NextResponse.json({ error: "Too many unsubscribe attempts. Please try again later." }, { status: 429 });
    }

    const body = await readJson(request, 2_000);
    const token = isRecord(body) && typeof body.token === "string" ? body.token : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
      throw new RequestInputError("The unsubscribe link is invalid.");
    }

    await mongoCommand({
      action: "adminMutation",
      mutation: {
        action: "updateOne", collection: "subscribers",
        filter: { unsubscribe_token: token },
        update: { $set: { status: "unsubscribed", updated_at: new Date().toISOString() } }
      },
      audit: {
        id: randomUUID(), entity: "subscriber", action: "unsubscribed",
        detail: "A newsletter subscriber unsubscribed.", created_at: new Date().toISOString()
      }
    });
    return NextResponse.json({ message: "You have been unsubscribed from Colgar updates." });
  } catch (error) {
    if (error instanceof RequestInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Could not complete a Colgar unsubscribe request.", error);
    return NextResponse.json({ error: "We could not complete the unsubscribe request." }, { status: 503 });
  }
}
