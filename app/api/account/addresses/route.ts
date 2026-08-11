import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
import { sanitizeText } from "@/lib/sanitize";
const clean = (maximum: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maximum)
    .transform((value) => sanitizeText(value, maximum));
const schema = z.object({
  label: clean(60),
  recipientName: clean(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ()-]{7,20}$/),
  line1: clean(200),
  line2: z
    .string()
    .trim()
    .max(200)
    .transform((value) => sanitizeText(value, 200))
    .optional(),
  city: clean(100),
  state: clean(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9 -]{3,12}$/),
  country: clean(80).default("India"),
  isDefault: z.boolean().default(false),
});
export async function GET() {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  return NextResponse.json({
    data: await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  });
}
export async function POST(request: Request) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please complete all required address fields." },
      { status: 400 },
    );
  const data = parsed.data;
  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault)
      await tx.address.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    return tx.address.create({ data: { ...data, userId: session.id } });
  });
  return NextResponse.json({ data: address }, { status: 201 });
}
