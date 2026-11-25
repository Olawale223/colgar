import { NextResponse, type NextRequest } from "next/server";

function deploymentRole() {
  const role = process.env.APP_ROLE;
  if (role === "admin" || role === "public" || role === "combined") return role;
  return process.env.NODE_ENV === "production" ? "public" : "combined";
}

function isAdminPage(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

function authResponse(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function middleware(request: NextRequest) {
  const role = deploymentRole();
  const path = request.nextUrl.pathname;
  const isAdminApi = path.startsWith("/api/admin/");
  const isSignedProviderWebhook = path === "/api/public/payments/webhook";

  if (!isSignedProviderWebhook && request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
    const origin = request.headers.get("origin");
    if (origin !== request.nextUrl.origin) {
      return authResponse(403, "The request origin is not allowed.");
    }
  }

  if (role === "public" && (isAdminPage(path) || isAdminApi)) {
    return new NextResponse(null, { status: 404 });
  }

  if (role === "admin") {
    if (path === "/") return NextResponse.redirect(new URL("/admin", request.url));
    if (!isAdminPage(path) && !isAdminApi) {
      return new NextResponse(null, { status: 404 });
    }
  }

  if (role === "admin" && isAdminApi && !request.headers.has("cf-access-jwt-assertion")) {
    return authResponse(401, "Sign in through the staff Cloudflare Access application.");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
