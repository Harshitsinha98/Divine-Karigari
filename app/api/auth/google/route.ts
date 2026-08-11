import { NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/account";

  const supabase = createSupabaseAnonClient();

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url)
    return NextResponse.json(
      { error: "Unable to initiate Google sign-in." },
      { status: 500 },
    );

  return NextResponse.redirect(data.url);
}
