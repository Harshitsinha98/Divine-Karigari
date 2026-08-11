import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  amount: z.number().positive().max(100000),
  reason: z
    .string()
    .trim()
    .transform((value) => sanitizeText(value, 300))
    .pipe(z.string().min(3).max(300)),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { admin, error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  try {
    const input = schema.parse(await request.json());
    const customer = await prisma.user.findFirst({
      where: { id: params.id, role: "CUSTOMER" },
      select: { id: true },
    });
    if (!customer)
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    const amount = new Prisma.Decimal(input.amount);
    const wallet = await prisma.wallet.upsert({
      where: { userId: customer.id },
      create: {
        userId: customer.id,
        balance: amount,
        transactions: {
          create: {
            type: "CREDIT",
            amount,
            description: input.reason,
            reference: `ADMIN:${admin!.staffId}`,
          },
        },
      },
      update: {
        balance: { increment: amount },
        transactions: {
          create: {
            type: "CREDIT",
            amount,
            description: input.reason,
            reference: `ADMIN:${admin!.staffId}`,
          },
        },
      },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 30 } },
    });
    return NextResponse.json({ data: wallet });
  } catch (caught) {
    return adminError(caught);
  }
}
