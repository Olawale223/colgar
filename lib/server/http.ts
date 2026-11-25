import { createHmac } from "node:crypto";
import { mongoCommand, getRuntimeEnv } from "@/lib/server/mongo-store";

export class RequestInputError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export async function readRawBody(request: Request, maxBytes = 32_000) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) throw new RequestInputError("Request body is too large.", 413);

  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new RequestInputError("Request body is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function readJson(request: Request, maxBytes = 32_000): Promise<unknown> {
  const body = await readRawBody(request, maxBytes);
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new RequestInputError("Request body must be valid JSON.");
  }
}

export async function consumeRequestLimit(
  request: Request,
  scope: string,
  maxHits: number,
  windowSeconds: number
) {
  const env = await getRuntimeEnv() as Record<string, string | undefined>;
  const secret = env.RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32) throw new Error("RATE_LIMIT_SECRET must contain at least 32 characters.");

  const cloudflareIp = request.headers.get("cf-connecting-ip");
  const fallbackIp = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  const ip = cloudflareIp || fallbackIp || "unknown";
  const key = createHmac("sha256", secret).update(ip).digest("hex");
  return mongoCommand<boolean>({
    action: "consumeRateLimit",
    key,
    scope,
    maxHits,
    windowSeconds
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character] ?? character);
}
