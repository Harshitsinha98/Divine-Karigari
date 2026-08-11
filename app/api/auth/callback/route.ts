import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  if (!code) {
    console.error("[auth-callback] No code received. Params:", Object.fromEntries(searchParams.entries()));
    return NextResponse.redirect(new URL(`/login?error=missing_code`, appUrl));
  }

  try {
    // Use service_role key to exchange code — works server-side without cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Exchange authorization code for user session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.user) {
      console.error("[auth-callback] Code exchange failed:", sessionError?.message);

      // Fallback: try to get user by the code as an access token
      const { data: userData, error: userError } =
        await supabase.auth.getUser(code);

      if (userError || !userData.user) {
        console.error("[auth-callback] Fallback also failed:", userError?.message);
        return NextResponse.redirect(new URL(`/login?error=auth_failed`, appUrl));
      }

      // Use fallback user data
      return await handleUser(userData.user, next, appUrl);
    }

    return await handleUser(sessionData.user, next, appUrl);
  } catch (err) {
    console.error("[auth-callback] Unexpected error:", err);
    return NextResponse.redirect(new URL(`/login?error=server_error`, appUrl));
  }
}

async function handleUser(
  supabaseUser: { email?: string; user_metadata?: Record<string, unknown> },
  next: string,
  appUrl: string,
) {
  const email =
    supabaseUser.email ??
    (supabaseUser.user_metadata?.email as string | undefined);
  const name =
    (supabaseUser.user_metadata?.full_name as string | undefined) ??
    (supabaseUser.user_metadata?.name as string | undefined);

  if (!email) {
    console.error("[auth-callback] No email from provider");
    return NextResponse.redirect(new URL(`/login?error=no_email`, appUrl));
  }

  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name ?? null,
        authProvider: "google",
        wallet: { create: {} },
        cart: { create: {} },
        wishlist: { create: {} },
      },
    });
  } else if (!user.authProvider || user.authProvider === "email") {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        authProvider: "google",
        name: user.name ?? name ?? null,
      },
    });
  }

  // Create our app session (JWT cookie) and redirect
  const response = NextResponse.redirect(new URL(next, appUrl));
  await setSessionCookie(response, {
    id: user.id,
    email: user.email,
    role: user.role,
  });
  return response;
}
