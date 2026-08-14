import { NextResponse } from "next/server";
import { accountSession, accountUnauthorized } from "@/lib/account-api";
import { cancelOrder, OrderCancellationError } from "@/lib/order-cancellation";
import { prisma } from "@/lib/prisma";

type Context = { params: { id: string } };

export async function POST(_: Request, { params }: Context) {
  const session = await accountSession();
  if (!session) return accountUnauthorized();

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.id },
    select: { id: true },
  });
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    const cancelled = await cancelOrder(order.id, "CUSTOMER");
    return NextResponse.json({ data: cancelled });
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Order cancellation failed.";
    return NextResponse.json(
      { error: message },
      { status: caught instanceof OrderCancellationError ? 409 : 502 },
    );
  }
}
