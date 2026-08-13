import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
import { sanitizeText } from "@/lib/sanitize";
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .transform((value) => sanitizeText(value, 120)),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ()-]{7,20}$/),
  notificationPreferences: z
    .object({
      orderUpdates: z.boolean().optional(),
      mobileUpdates: z.boolean().optional(),
      giftingNotes: z.boolean().optional(),
    })
    .strict()
    .optional(),
});
export async function GET() {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      authProvider: true,
      emailVerified: true,
      phoneVerified: true,
      notificationPreferences: true,
    },
  });
  return NextResponse.json({ data: user });
}
export async function PATCH(request: Request) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please check your details." },
      { status: 400 },
    );
  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      ...(parsed.data.notificationPreferences
        ? { notificationPreferences: parsed.data.notificationPreferences }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      notificationPreferences: true,
    },
  });
  return NextResponse.json({ data: user });
}
