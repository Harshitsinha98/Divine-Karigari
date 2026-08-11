import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Phone must be in international format (e.g. +919876543210)"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Enter a valid phone number in international format." },
      { status: 400 },
    );

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: parsed.data.phone,
    });

    if (error)
      return NextResponse.json(
        { error: error.message ?? "Unable to send OTP. Please try again." },
        { status: 400 },
      );

    return NextResponse.json({ data: { sent: true } });
  } catch {
    return NextResponse.json(
      { error: "Unable to send OTP right now. Please try again later." },
      { status: 500 },
    );
  }
}
