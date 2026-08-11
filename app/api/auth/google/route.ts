import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/account";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  // Use anon client with PKCE flow — this sends a code to the callback
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        flowType: "pkce",
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/api/auth/callback?next=${encodeURIComponent(next)}`,
      skipBrowserRedirect: false,
    },
  });

  if (error || !data.url) {
    console.error("[google-oauth] Failed to initiate:", error);
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed`, appUrl),
    );
  }

  return NextResponse.redirect(data.url);
}
