import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
const schema = z.object({
  type: z.enum(["card", "upi"]),
  label: z.string().min(1),
  last4: z.string().max(4).optional(),
  isDefault: z.boolean().default(false),
});
export async function GET() {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  return NextResponse.json({
    data: await prisma.savedPaymentMethod.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        label: true,
        last4: true,
        isDefault: true,
        createdAt: true,
      },
    }),
  });
}
export async function POST(request: Request) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please enter a valid payment method." },
      { status: 400 },
    );
  const data = parsed.data;
  const method = await prisma.$transaction(async (tx) => {
    if (data.isDefault)
      await tx.savedPaymentMethod.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    return tx.savedPaymentMethod.create({
      data: { ...data, userId: session.id },
    });
  });
  return NextResponse.json({ data: method }, { status: 201 });
}
