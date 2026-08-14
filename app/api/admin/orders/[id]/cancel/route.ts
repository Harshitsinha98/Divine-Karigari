import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { cancelOrder, OrderCancellationError } from "@/lib/order-cancellation";

type Context = { params: { id: string } };

export async function POST(_: Request, { params }: Context) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;

  try {
    const cancelled = await cancelOrder(params.id, "ADMIN");
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
