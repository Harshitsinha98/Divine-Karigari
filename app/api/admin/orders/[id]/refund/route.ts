import { NextResponse } from "next/server";
import { Prisma, RefundDestination } from "@prisma/client";
import { z } from "zod";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  amount: z.number().positive(),
  reason: z
    .string()
    .trim()
    .transform((value) => sanitizeText(value, 500))
    .pipe(z.string().min(3).max(500)),
  destination: z.nativeEnum(RefundDestination),
});
const roles = ["ORDER_MANAGER"] as const;
type Context = { params: { id: string } };
export async function POST(request: Request, { params }: Context) {
  const { admin, error } = await requireAdmin(roles);
  if (error) return error;
  try {
    const input = schema.parse(await request.json());
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { payments: true, refunds: { where: { status: "PROCESSED" } } },
    });
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const alreadyRefunded = order.refunds.reduce(
      (sum, refund) => sum + Number(refund.amount),
      0,
    );
    if (input.amount > Number(order.total) - alreadyRefunded + 0.001)
      return NextResponse.json(
        { error: "Refund exceeds the refundable balance." },
        { status: 422 },
      );
    const payment =
      order.payments.find(
        (item) =>
          item.status === "PAID" || item.status === "PARTIALLY_REFUNDED",
      ) ?? null;
    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        paymentId: payment?.id,
        staffId: admin!.staffId,
        destination: input.destination,
        amount: new Prisma.Decimal(input.amount),
        reason: input.reason,
      },
    });
    try {
      let providerRefundId: string | undefined;
      if (input.destination === "ORIGINAL_PAYMENT") {
        if (!payment?.providerPaymentId || payment.provider !== "RAZORPAY")
          throw new Error(
            "This payment cannot be refunded to its original method.",
          );
        const razorpay = getRazorpay();
        if (!razorpay) throw new Error("Razorpay is not configured.");
        const response = await razorpay.payments.refund(
          payment.providerPaymentId,
          { amount: Math.round(input.amount * 100) },
        );
        providerRefundId = response.id;
      } else {
        await prisma.wallet.upsert({
          where: { userId: order.userId },
          create: {
            userId: order.userId,
            balance: new Prisma.Decimal(input.amount),
            transactions: {
              create: {
                type: "REFUND",
                amount: new Prisma.Decimal(input.amount),
                description: `Refund for ${order.orderNumber}`,
                reference: refund.id,
              },
            },
          },
          update: {
            balance: { increment: new Prisma.Decimal(input.amount) },
            transactions: {
              create: {
                type: "REFUND",
                amount: new Prisma.Decimal(input.amount),
                description: `Refund for ${order.orderNumber}`,
                reference: refund.id,
              },
            },
          },
        });
      }
      const totalRefunded = alreadyRefunded + input.amount;
      const status =
        totalRefunded + 0.001 >= Number(order.total)
          ? "REFUNDED"
          : "PARTIALLY_REFUNDED";
      const result = await prisma.$transaction(async (tx) => {
        await tx.refund.update({
          where: { id: refund.id },
          data: { status: "PROCESSED", providerRefundId },
        });
        if (payment)
          await tx.payment.update({
            where: { id: payment.id },
            data: { status },
          });
        return tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: status },
        });
      });
      return NextResponse.json({
        data: { refundId: refund.id, paymentStatus: result.paymentStatus },
      });
    } catch (providerError) {
      await prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: "FAILED",
          errorMessage:
            providerError instanceof Error
              ? providerError.message
              : "Refund failed.",
        },
      });
      return NextResponse.json(
        {
          error:
            providerError instanceof Error
              ? providerError.message
              : "Refund failed.",
        },
        { status: 422 },
      );
    }
  } catch (caught) {
    return adminError(caught);
  }
}
