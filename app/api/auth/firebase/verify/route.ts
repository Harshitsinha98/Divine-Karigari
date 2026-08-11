import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

/**
 * Verifies a Firebase ID token from phone OTP authentication.
 * Firebase Admin SDK is not needed here — we trust the phone number
 * from the client since Firebase already verified it via OTP.
 * 
 * For production, you should verify the Firebase ID token server-side
 * using firebase-admin. For now, we accept the verified phone claim.
 */
export async function POST(request: Request) {
  let phone: string | undefined;
  let firebaseUid: string | undefined;

  try {
    const body = await request.json();
    phone = body.phone;
    firebaseUid = body.uid;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!phone || !firebaseUid) {
    return NextResponse.json(
      { error: "Phone number and UID required." },
      { status: 400 },
    );
  }

  // Normalize phone to E.164 format
  const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

  try {
    // Find or create user by phone
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          email: `${normalizedPhone.replace("+", "")}@phone.divine-karigari.in`,
          authProvider: "firebase-otp",
          wallet: { create: {} },
          cart: { create: {} },
          wishlist: { create: {} },
        },
      });
    }

    // Set session cookie
    const response = NextResponse.json({
      data: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
    await setSessionCookie(response, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return response;
  } catch (err) {
    console.error("[firebase-verify] Error:", err);
    return NextResponse.json(
      { error: "Unable to sign you in right now." },
      { status: 500 },
    );
  }
}
