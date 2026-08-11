import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/account";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.error("[google-oauth] NEXT_PUBLIC_SUPABASE_URL is not set");
    return NextResponse.redirect(new URL(`/login?error=server_error`, appUrl));
  }

  // Manually construct the Supabase OAuth authorize URL.
  // This is more reliable than signInWithOAuth() in a server context,
  // which can produce a relative URL and redirect to the wrong domain.
  const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  const authorizeUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", redirectTo);

  return NextResponse.redirect(authorizeUrl.toString());
}
