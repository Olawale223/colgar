import { createRemoteJWKSet, jwtVerify } from "jose";
import { headers } from "next/headers";
import { getRuntimeEnv, mongoCommand } from "@/lib/server/mongo-store";

export type StaffRole = "admin" | "content_editor" | "finance_manager";
export type StaffUser = { id: string; email: string; role: StaffRole };
type StaffRecord = { email: string; role: StaffRole; enabled: boolean };
type AccessEnv = {
  CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string;
  CLOUDFLARE_ACCESS_AUD?: string;
};

let cachedJwks: { issuer: string; keys: ReturnType<typeof createRemoteJWKSet> } | undefined;

export async function getStaffSession(allowedRoles: StaffRole[] = ["admin", "content_editor", "finance_manager"]) {
  const requestHeaders = await headers();
  const token = requestHeaders.get("cf-access-jwt-assertion");
  if (!token) return { user: null, error: "Sign in through the Colgar staff Cloudflare Access application.", status: 401 };

  let issuer: string;
  let audience: string;
  let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];
  try {
    const env = await getRuntimeEnv() as AccessEnv;
    issuer = env.CLOUDFLARE_ACCESS_TEAM_DOMAIN?.replace(/\/+$/, "") ?? "";
    audience = env.CLOUDFLARE_ACCESS_AUD ?? "";
    if (!issuer || !audience) {
      return { user: null, error: "Cloudflare Access is not configured for staff access.", status: 503 };
    }

    if (!cachedJwks || cachedJwks.issuer !== issuer) {
      cachedJwks = {
        issuer,
        keys: createRemoteJWKSet(new URL("/cdn-cgi/access/certs", issuer))
      };
    }
    ({ payload } = await jwtVerify(token, cachedJwks.keys, { issuer, audience }));
  } catch (error) {
    console.error("Could not verify the Colgar Cloudflare Access identity.", error);
    return { user: null, error: "Staff identity could not be verified.", status: 401 };
  }
  if (typeof payload.email !== "string" || typeof payload.sub !== "string") {
    return { user: null, error: "The Cloudflare Access identity is incomplete.", status: 401 };
  }

  const email = payload.email.trim().toLowerCase();
  let staff: StaffRecord | null;
  try {
    staff = await mongoCommand<StaffRecord | null>({
      action: "findOne",
      collection: "staff",
      filter: { email, enabled: true },
      projection: { email: 1, role: 1, enabled: 1 }
    });
  } catch (error) {
    console.error("Could not load the Colgar staff access record.", error);
    return { user: null, error: "Staff access could not be verified right now.", status: 503 };
  }
  if (!staff || !["admin", "content_editor", "finance_manager"].includes(staff.role)) {
    return { user: null, error: "This account is not authorized for the Admin Studio.", status: 403 };
  }
  if (!allowedRoles.includes(staff.role)) {
    return { user: null, error: "This account is not authorized for this operation.", status: 403 };
  }
  return { user: { id: payload.sub, email, role: staff.role }, error: "", status: 200 };
}
