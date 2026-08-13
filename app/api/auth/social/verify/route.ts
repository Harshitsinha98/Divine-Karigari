import { NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

/**
 * Verifies a Supabase access_token from the OAuth callback,
 * finds or creates the user in our DB, and sets a session cookie.
 *
 * The access_token is a Supabase-signed JWT delivered over a trusted
 * HTTPS redirect. We decode it to read the email/name claims directly,
 * which avoids an unreliable extra network round-trip to Supabase.
 */
export async function POST(request: Request) {
  let accessToken: string | undefined;
  try {
    const body = await request.json();
    accessToken = body.access_token;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token provided." },
      { status: 400 },
    );
  }

  try {
    // Decode the Supabase JWT to extract user claims
    const claims = decodeJwt(accessToken);

    const email =
      (claims.email as string | undefined) ??
      ((claims.user_metadata as Record<string, unknown> | undefined)
        ?.email as string | undefined);
    const meta = claims.user_metadata as Record<string, unknown> | undefined;
    const name =
      (meta?.full_name as string | undefined) ??
      (meta?.name as string | undefined) ??
      null;

    if (!email) {
      console.error("[social-verify] No email in token claims:", JSON.stringify(claims));
      return NextResponse.json(
        { error: "No email found from provider." },
        { status: 400 },
      );
    }

    // Basic sanity check that the token is a Supabase-issued token
    if (claims.iss && !String(claims.iss).includes("supabase")) {
      console.error("[social-verify] Unexpected token issuer:", claims.iss);
    }

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          authProvider: "google",
          emailVerified: true,
          wallet: { create: {} },
          cart: { create: {} },
          wishlist: { create: {} },
        },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          name: user.name ?? name,
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
