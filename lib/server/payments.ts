import { randomUUID } from "node:crypto";
import { getRuntimeEnv, mongoCommand } from "@/lib/server/mongo-store";

type PaystackVerification = {
  status?: boolean;
  data?: {
    id?: number;
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    customer?: { email?: string };
  };
};

export async function verifyAndRecordPaystackPayment(reference: string) {
  const env = await getRuntimeEnv() as Record<string, string | undefined>;
  const secretKey = env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store"
  });
  if (!response.ok) {
    console.error("Paystack could not verify a Colgar payment.", response.status);
    return false;
  }
  const verification = await response.json() as PaystackVerification;
  const payment = verification.data;
  if (!verification.status || payment?.status !== "success" || payment.reference !== reference) return false;

  const order = await mongoCommand<{
    reference: string; status: string; email: string; amount_kobo: number; currency: string;
  } | null>({
    action: "findOne", collection: "orders", filter: { reference },
    projection: { reference: 1, status: 1, email: 1, amount_kobo: 1, currency: 1 }
  });
  if (!order || order.amount_kobo !== payment.amount || order.currency !== payment.currency
    || order.email.toLowerCase() !== payment.customer?.email?.toLowerCase()) {
    console.error("Paystack payment data did not match the saved Colgar order.");
    return false;
  }
  if (order.status === "paid") return true;
  if (order.status !== "pending") return false;

  const now = new Date().toISOString();
  const updated = await mongoCommand<{ modifiedCount: number }>({
    action: "adminMutation",
    mutation: {
      action: "updateOne", collection: "orders", filter: { reference, status: "pending" },
      update: { $set: { status: "paid", provider_reference: reference, paid_at: now, updated_at: now } }
    },
    audit: {
      id: randomUUID(),
      entity: "orders",
      action: "updated",
      detail: `Order ${reference} marked paid.`,
      created_at: now
    }
  });
  if (updated.modifiedCount) {
    return true;
  }
  const latest = await mongoCommand<{ status: string } | null>({
    action: "findOne", collection: "orders", filter: { reference }, projection: { status: 1 }
  });
  return latest?.status === "paid";
}
