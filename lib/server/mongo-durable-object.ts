import { DurableObject } from "cloudflare:workers";
import { MongoClient } from "mongodb";
import { executeMongoCommand, isMongoCommand, mongoWriteSucceeded } from "@/lib/server/mongo-store";

type MongoEnv = {
  MONGODB_URI: string;
  MONGODB_DB?: string;
};

export class MongoDBConnection extends DurableObject<MongoEnv> {
  private readonly client: MongoClient;

  constructor(state: DurableObjectState, env: MongoEnv) {
    super(state, env);
    this.client = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      maxIdleTimeMS: 20_000
    });
  }

  async fetch(request: Request) {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/command") {
      return Response.json({ error: "Not found." }, { status: 404 });
    }

    try {
      const requestBody: unknown = await request.json();
      if (!isMongoCommand(requestBody)) {
        return Response.json({ error: "The database command is invalid." }, { status: 400 });
      }
      const command = requestBody;
      if (command.action === "consumeRateLimit") {
        return Response.json({ result: await this.consumeRateLimit(command) });
      }

      const db = this.client.db(this.env.MONGODB_DB || "colgar");
      await this.client.connect();
      if (command.action === "adminMutation") {
        const session = this.client.startSession();
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
          return Response.json({ result });
        } finally {
          await session.endSession();
        }
      }
      const result = await executeMongoCommand(db, command);
      return Response.json({ result });
    } catch (error) {
      console.error("MongoDB Durable Object request failed.", error);
      return Response.json({ error: "The database request could not be completed." }, { status: 503 });
    }
  }

  private async consumeRateLimit(command: Extract<import("@/lib/server/mongo-store").MongoCommand, { action: "consumeRateLimit" }>) {
    if (!Number.isInteger(command.maxHits) || command.maxHits < 1
      || !Number.isInteger(command.windowSeconds) || command.windowSeconds < 1) {
      throw new Error("Rate-limit request is invalid.");
    }
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL)"
    );
    const now = Date.now();
    this.ctx.storage.sql.exec("DELETE FROM rate_limits WHERE expires_at <= ?", now);
    const key = `${command.scope}:${command.key}`;
    const current = this.ctx.storage.sql.exec(
      "SELECT hits, expires_at FROM rate_limits WHERE key = ?",
      key
    ).toArray()[0] as { hits: number; expires_at: number } | undefined;
    if (current && current.hits >= command.maxHits) return false;
    this.ctx.storage.sql.exec(
      `INSERT INTO rate_limits (key, hits, expires_at)
       VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET hits = hits + 1`,
      key,
      current ? current.expires_at : now + command.windowSeconds * 1000
    );
    return true;
  }
}
