import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (!code) {
    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(errorUrl);
  }

  try {
    const supabase = createSupabaseServerClient();

    // Exchange the code for a session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.user) {
      const errorUrl = new URL("/login", origin);
      errorUrl.searchParams.set("error", "auth_failed");
      return NextResponse.redirect(errorUrl);
    }

    const supabaseUser = sessionData.user;
    const email =
      supabaseUser.email ??
      supabaseUser.user_metadata?.email;
    const name =
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name;

    if (!email) {
      const errorUrl = new URL("/login", origin);
      errorUrl.searchParams.set("error", "no_email");
      return NextResponse.redirect(errorUrl);
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
      // Link Google to existing email account
      await prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider: "google",
          name: user.name ?? name ?? null,
        },
      });
    }

    // Create our app session (JWT cookie)
    const redirectUrl = new URL(next, origin);
    const response = NextResponse.redirect(redirectUrl);
    await setSessionCookie(response, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return response;
  } catch {
    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(errorUrl);
  }
}
