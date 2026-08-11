import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin, hash } = new URL(request.url);
  const code = searchParams.get("code");
  const accessToken = searchParams.get("access_token");
  const next = searchParams.get("next") ?? "/account";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  // If no code and no access_token, this might be an implicit flow
  // where tokens come as hash fragments (handled client-side)
  if (!code && !accessToken) {
    console.error("[auth-callback] No code or access_token received");
    return NextResponse.redirect(
      new URL(`/login?error=missing_code`, appUrl),
    );
  }

  try {
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

    let email: string | undefined;
    let name: string | undefined;

    if (code) {
      // PKCE flow: exchange code for session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError || !sessionData.user) {
        console.error("[auth-callback] Code exchange failed:", sessionError?.message);
        return NextResponse.redirect(
          new URL(`/login?error=auth_failed`, appUrl),
        );
      }

      email = sessionData.user.email ?? sessionData.user.user_metadata?.email;
      name =
        sessionData.user.user_metadata?.full_name ??
        sessionData.user.user_metadata?.name;
    } else if (accessToken) {
      // Implicit flow: use access token to get user
      const { data: userData, error: userError } =
        await supabase.auth.getUser(accessToken);

      if (userError || !userData.user) {
        console.error("[auth-callback] Token validation failed:", userError?.message);
        return NextResponse.redirect(
          new URL(`/login?error=auth_failed`, appUrl),
        );
      }

      email = userData.user.email ?? userData.user.user_metadata?.email;
      name =
        userData.user.user_metadata?.full_name ??
        userData.user.user_metadata?.name;
    }

    if (!email) {
      console.error("[auth-callback] No email from provider");
      return NextResponse.redirect(
        new URL(`/login?error=no_email`, appUrl),
      );
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
  } catch (err) {
    console.error("[auth-callback] Unexpected error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=server_error`, appUrl),
    );
  }
}
