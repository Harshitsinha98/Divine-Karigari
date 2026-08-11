import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
export async function GET() {
  const session = await accountSession();
  if (!session) return accountUnauthorized();
  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    data: orders.map((order) => ({
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
    })),
  });
}
