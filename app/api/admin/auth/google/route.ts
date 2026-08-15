import { NextResponse } from "next/server";

// Initiate Google OAuth for admin login via Supabase (same provider as customers,
// but the callback is admin-specific and enforces a strict email allowlist).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/admin";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.error("[admin-google-oauth] NEXT_PUBLIC_SUPABASE_URL is not set");
    return NextResponse.redirect(
      new URL("/admin/login?error=server_error", appUrl),
    );
  }

  // Encode admin intent directly in the redirect URL path (not query params)
  // because Supabase strips custom query params during the OAuth flow.
  const redirectTo = `${appUrl}/auth/callback/admin?next=${encodeURIComponent(next)}`;

  const authorizeUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", redirectTo);

  return NextResponse.redirect(authorizeUrl.toString());
}
