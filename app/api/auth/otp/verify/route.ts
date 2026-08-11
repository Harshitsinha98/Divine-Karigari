import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/),
  otp: z.string().trim().length(6),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid phone number and 6-digit OTP." },
      { status: 400 },
    );

  try {
    const supabase = createSupabaseServerClient();

    // Verify OTP with Supabase
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        phone: parsed.data.phone,
        token: parsed.data.otp,
        type: "sms",
      });

    if (verifyError || !verifyData.user)
      return NextResponse.json(
        { error: verifyError?.message ?? "Invalid or expired OTP." },
        { status: 401 },
      );

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { phone: parsed.data.phone },
    });

    if (!user) {
      // Create new user from OTP signup
      user = await prisma.user.create({
        data: {
          phone: parsed.data.phone,
          email: verifyData.user.email ?? `${parsed.data.phone.replace("+", "")}@phone.divine-karigari.in`,
          authProvider: "otp",
          wallet: { create: {} },
          cart: { create: {} },
          wishlist: { create: {} },
        },
      });
    } else if (!user.authProvider) {
      // Update existing user to note they also use OTP
      await prisma.user.update({
        where: { id: user.id },
        data: { authProvider: user.authProvider ?? "otp" },
      });
    }

    const response = NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isNewUser: !user.name,
      },
    });
    await setSessionCookie(response, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to verify OTP right now. Please try again." },
      { status: 500 },
    );
  }
}
