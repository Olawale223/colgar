import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

nextEnv.loadEnvConfig(process.cwd());
const [rawEmail, role] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();
const roles = new Set(["admin", "content_editor", "finance_manager"]);
const uri = process.env.MONGODB_URI;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role || !roles.has(role)) {
  throw new Error("Usage: npm run staff:provision -- <email> <admin|content_editor|finance_manager>");
}
if (!uri) throw new Error("Set MONGODB_URI before provisioning staff.");

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "colgar");
  await db.collection("staff").updateOne(
    { email },
    {
      $set: { email, role, enabled: true, updated_at: new Date().toISOString() },
      $setOnInsert: { created_at: new Date().toISOString() }
    },
    { upsert: true }
  );
  console.log(`Provisioned ${email} as ${role}.`);
} finally {
  await client.close();
}
