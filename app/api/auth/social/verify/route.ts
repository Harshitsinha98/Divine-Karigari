import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

/**
 * Verifies a Supabase access_token from the OAuth callback,
 * finds or creates the user in our DB, and sets a session cookie.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const accessToken = body.access_token;

  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token provided." },
      { status: 400 },
    );
  }

  try {
    // Use service_role to verify the token and get user info
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

    const { data: userData, error: userError } =
      await supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      console.error("[social-verify] Token verification failed:", userError?.message);
      return NextResponse.json(
        { error: "Invalid token." },
        { status: 401 },
      );
    }

    const supabaseUser = userData.user;
    const email =
      supabaseUser.email ?? (supabaseUser.user_metadata?.email as string);
    const name =
      (supabaseUser.user_metadata?.full_name as string) ??
      (supabaseUser.user_metadata?.name as string);

    if (!email) {
      return NextResponse.json(
        { error: "No email found from provider." },
        { status: 400 },
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

    // Set our app session cookie
    const response = NextResponse.json({
      data: { id: user.id, name: user.name, email: user.email },
    });
    await setSessionCookie(response, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return response;
  } catch (err) {
    console.error("[social-verify] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unable to sign you in right now." },
      { status: 500 },
    );
  }
}
