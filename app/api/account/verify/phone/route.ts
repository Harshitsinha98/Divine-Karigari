import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";

/**
 * Confirms phone verification after Firebase OTP succeeds client-side.
 * Sets phoneVerified = true and stores the verified phone number.
 */
const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/),
  uid: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid phone verification." },
      { status: 400 },
    );

  const phone = parsed.data.phone;

  // Ensure phone isn't linked to another account
  const existing = await prisma.user.findFirst({
    where: { phone, id: { not: session.id } },
  });
  if (existing)
    return NextResponse.json(
      { error: "This phone number is already linked to another account." },
      { status: 409 },
    );

  await prisma.user.update({
    where: { id: session.id },
    data: { phone, phoneVerified: true },
  });

  return NextResponse.json({ data: { verified: true, phone } });
}
