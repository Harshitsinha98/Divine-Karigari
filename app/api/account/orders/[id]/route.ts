import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.id },
    include: { items: { include: { product: true } }, payments: true },
  });
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({
    data: {
      ...order,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        image: item.product.images[0],
      })),
      payments: order.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    },
  });
}
