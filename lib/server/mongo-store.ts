import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MongoClient, type ClientSession, type Db, type Document } from "mongodb";

type MongoWriteCommand =
  | { action: "insertOne"; collection: string; document: Document }
  | { action: "updateOne"; collection: string; filter: Document; update: Document; upsert?: boolean }
  | { action: "updateMany"; collection: string; filter: Document; update: Document }
  | { action: "deleteOne"; collection: string; filter: Document };

export type MongoCommand =
  | { action: "find"; collection: string; filter: Document; sort?: Document; limit?: number; projection?: Document }
  | { action: "findOne"; collection: string; filter: Document; projection?: Document }
  | MongoWriteCommand
  | { action: "adminMutation"; mutation: MongoWriteCommand; audit: Document }
  | { action: "consumeRateLimit"; key: string; scope: string; maxHits: number; windowSeconds: number };

const allowedCollections = new Set([
  "blog_posts",
  "products",
  "subscribers",
  "finance_entries",
  "audit_events",
  "orders",
  "newsletter_deliveries",
  "staff"
]);

let localClient: MongoClient | undefined;

export function isMongoCommand(value: unknown): value is MongoCommand {
  if (!isRecord(value) || typeof value.action !== "string") return false;
  if (value.action === "consumeRateLimit") {
    return typeof value.key === "string" && typeof value.scope === "string"
      && typeof value.maxHits === "number" && typeof value.windowSeconds === "number";
  }
  if (value.action === "adminMutation") {
    return isMongoWriteCommand(value.mutation) && isRecord(value.audit);
  }
  return isMongoWriteCommand(value) || isMongoReadCommand(value);
}

function isMongoWriteCommand(value: unknown): value is MongoWriteCommand {
  if (!isRecord(value) || typeof value.action !== "string") return false;
  if (typeof value.collection !== "string" || !allowedCollections.has(value.collection)) return false;
  switch (value.action) {
    case "insertOne":
      return isRecord(value.document);
    case "updateOne":
      return isRecord(value.filter) && isRecord(value.update) && (value.upsert === undefined || typeof value.upsert === "boolean");
    case "updateMany":
      return isRecord(value.filter) && isRecord(value.update);
    case "deleteOne":
      return isRecord(value.filter);
    default:
      return false;
  }
}

function isMongoReadCommand(value: unknown): value is Extract<MongoCommand, { action: "find" | "findOne" }> {
  if (!isRecord(value) || typeof value.action !== "string"
    || typeof value.collection !== "string" || !allowedCollections.has(value.collection)) return false;
  switch (value.action) {
    case "find":
      return isRecord(value.filter)
        && (value.sort === undefined || isRecord(value.sort))
        && (value.projection === undefined || isRecord(value.projection))
        && (value.limit === undefined || typeof value.limit === "number");
    case "findOne":
      return isRecord(value.filter) && (value.projection === undefined || isRecord(value.projection));
    default:
      return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mongoWriteSucceeded(result: unknown) {
  if (!isRecord(result)) return false;
  if (typeof result.deletedCount === "number") return result.deletedCount > 0;
  if (typeof result.matchedCount === "number") {
    return result.matchedCount > 0 || (typeof result.upsertedCount === "number" && result.upsertedCount > 0);
  }
  return result.acknowledged === true;
}

export async function getRuntimeEnv() {
  if (process.env.NODE_ENV === "development") return process.env;
  return getCloudflareContext({ async: true }).then((context) => context.env);
}

async function localDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured for local development.");
  localClient ??= new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 });
  await localClient.connect();
  return localClient.db(process.env.MONGODB_DB || "colgar");
}

export async function mongoCommand<T>(command: MongoCommand): Promise<T> {
  if (command.action !== "consumeRateLimit" && command.action !== "adminMutation" && !allowedCollections.has(command.collection)) {
    throw new Error("MongoDB collection is not permitted.");
  }

  if (process.env.NODE_ENV === "development") {
    if (command.action === "consumeRateLimit") {
      return consumeLocalRateLimit(command) as T;
    }
    if (command.action === "adminMutation") {
      const db = await localDatabase();
      const session = localClient?.startSession();
      if (!session) throw new Error("A MongoDB session could not be opened.");
      try {
        let result: unknown;
        await session.withTransaction(async () => {
          result = await executeMongoCommand(db, command.mutation, session);
          if (mongoWriteSucceeded(result)) {
            await executeMongoCommand(db, {
              action: "insertOne",
              collection: "audit_events",
              document: command.audit
            }, session);
          }
        });
        return result as T;
      } finally {
        await session.endSession();
      }
    }
    return executeMongoCommand<T>(await localDatabase(), command);
  }

  const env = await getRuntimeEnv() as { MONGODB_CONNECTION?: DurableObjectNamespace };
  if (!env.MONGODB_CONNECTION) throw new Error("MongoDB Durable Object binding is not configured.");
  const stub = env.MONGODB_CONNECTION.get(env.MONGODB_CONNECTION.idFromName("colgar-main"));
  const response = await stub.fetch("https://mongodb.internal/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
  const result = await response.json() as { result?: T; error?: string };
  if (!response.ok) throw new Error(result.error ?? "MongoDB request failed.");
  return result.result as T;
}

export async function executeMongoCommand<T>(
  db: Db,
  command: MongoWriteCommand | Extract<MongoCommand, { action: "find" | "findOne" }>,
  session?: ClientSession
): Promise<T> {
  if (!allowedCollections.has(command.collection)) throw new Error("MongoDB collection is not permitted.");
  const collection = db.collection(command.collection);
  switch (command.action) {
    case "find": {
      let cursor = collection.find(command.filter, { projection: { _id: 0, ...command.projection } });
      if (command.sort) cursor = cursor.sort(command.sort);
      if (command.limit) cursor = cursor.limit(command.limit);
      return await cursor.toArray() as T;
    }
    case "findOne":
      return await collection.findOne(command.filter, { projection: { _id: 0, ...command.projection } }) as T;
    case "insertOne":
      return await collection.insertOne(command.document, { session }) as T;
    case "updateOne":
      return await collection.updateOne(command.filter, command.update, { upsert: command.upsert ?? false, session }) as T;
    case "updateMany":
      return await collection.updateMany(command.filter, command.update, { session }) as T;
    case "deleteOne":
      return await collection.deleteOne(command.filter, { session }) as T;
  }
}

const localRateLimits = new Map<string, { hits: number; expiresAt: number }>();

function consumeLocalRateLimit(command: Extract<MongoCommand, { action: "consumeRateLimit" }>) {
  const now = Date.now();
  const current = localRateLimits.get(`${command.scope}:${command.key}`);
  const bucket = !current || current.expiresAt <= now
    ? { hits: 0, expiresAt: now + command.windowSeconds * 1000 }
    : current;
  if (bucket.hits >= command.maxHits) return false;
  bucket.hits += 1;
  localRateLimits.set(`${command.scope}:${command.key}`, bucket);
  return true;
}
