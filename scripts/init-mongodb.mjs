import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

nextEnv.loadEnvConfig(process.cwd());
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Set MONGODB_URI before initializing MongoDB.");

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "colgar");
  await Promise.all([
    db.collection("blog_posts").createIndex({ id: 1 }, { unique: true }),
    db.collection("blog_posts").createIndex({ status: 1, updated_at: -1 }),
    db.collection("products").createIndex({ slug: 1 }, { unique: true }),
    db.collection("products").createIndex({ visible: 1, updated_at: -1 }),
    db.collection("subscribers").createIndex({ id: 1 }, { unique: true }),
    db.collection("subscribers").createIndex({ email: 1 }, { unique: true }),
    db.collection("subscribers").createIndex({ confirmation_token: 1 }, { unique: true }),
    db.collection("subscribers").createIndex({ unsubscribe_token: 1 }, { unique: true }),
    db.collection("finance_entries").createIndex({ id: 1 }, { unique: true }),
    db.collection("finance_entries").createIndex({ date: -1 }),
    db.collection("audit_events").createIndex({ id: 1 }, { unique: true }),
    db.collection("audit_events").createIndex({ created_at: -1 }),
    db.collection("orders").createIndex({ id: 1 }, { unique: true }),
    db.collection("orders").createIndex({ reference: 1 }, { unique: true }),
    db.collection("newsletter_deliveries").createIndex({ id: 1 }, { unique: true }),
    db.collection("staff").createIndex({ email: 1 }, { unique: true })
  ]);
  console.log(`MongoDB indexes initialized for ${db.databaseName}.`);
} finally {
  await client.close();
}
