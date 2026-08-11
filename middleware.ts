import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";
import { rateLimit } from "@/lib/rate-limit";

const ADMIN_SESSION_COOKIE = "divine_admin_session";

const webhookPaths = new Set([
  "/api/checkout/webhook",
  "/api/shiprocket/webhook",
]);

function csrfAllowed(request: NextRequest) {
  if (
    !["POST", "PUT", "PATCH", "DELETE"].includes(request.method) ||
    webhookPaths.has(request.nextUrl.pathname)
  )
    return true;
  const origin = request.headers.get("origin");
  if (!origin) {
    const apiKey = request.headers.get("x-api-key");
    return (
      process.env.NODE_ENV !== "production" ||
      Boolean(
        apiKey &&
        process.env.ADMIN_API_KEY &&
        apiKey === process.env.ADMIN_API_KEY,
      )
    );
  }
  const allowed = new Set([request.nextUrl.origin]);
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      allowed.add(new URL(process.env.NEXT_PUBLIC_APP_URL).origin);
    } catch {}
  }
  return allowed.has(origin);
}

export async function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    const secure = request.nextUrl.clone();
    secure.protocol = "https:";
    return NextResponse.redirect(secure, 308);
  }
  if (!csrfAllowed(request))
    return NextResponse.json(
      { error: "Cross-site request rejected." },
      { status: 403 },
    );
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const auth = request.nextUrl.pathname.startsWith("/api/auth/");
    const webhook = webhookPaths.has(request.nextUrl.pathname);
    const sensitive =
      auth ||
      request.nextUrl.pathname.startsWith("/api/checkout/") ||
      request.nextUrl.pathname === "/api/contact" ||
      request.nextUrl.pathname === "/api/newsletter";
    const result = await rateLimit(request, {
      namespace: webhook
        ? "webhook"
        : auth
          ? "auth"
          : sensitive
            ? "sensitive-api"
            : "api",
      limit: webhook ? 600 : auth ? 12 : sensitive ? 40 : 180,
      windowSeconds: auth ? 900 : 60,
    });
    if (!result.allowed)
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)),
            ),
          },
        },
      );
  }
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login" &&
    !request.cookies.has(ADMIN_SESSION_COOKIE)
  ) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (
    request.nextUrl.pathname.startsWith("/account") &&
    !request.cookies.has(SESSION_COOKIE)
  ) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
