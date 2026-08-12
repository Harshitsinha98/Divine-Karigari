import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const schema = z.object({
  reason: z.string().trim().min(3).max(500),
  notes: z.string().trim().max(1000).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSessionUser();
  if (!session)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please provide a valid reason for the return." },
      { status: 400 },
    );

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.id },
    include: { items: { include: { product: true } }, returnRequest: true },
  });

  if (!order)
    return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (order.status !== "DELIVERED")
    return NextResponse.json(
      { error: "Returns are only available for delivered orders." },
      { status: 422 },
    );

  // Check per-product return window (use minimum across all items, or global)
  const globalWindow = Number(process.env.RETURN_WINDOW_DAYS ?? 7);
  const productWindows = order.items.map(
    (item) => item.product.returnWindowDays ?? globalWindow,
  );
  const effectiveWindow = Math.min(...productWindows);
  const deliveredAt = order.deliveredAt ?? order.updatedAt;
  const deadline = deliveredAt.getTime() + effectiveWindow * 86400000;

  if (Date.now() > deadline)
    return NextResponse.json(
      {
        error: `Return window of ${effectiveWindow} days has expired for this order.`,
      },
      { status: 422 },
    );

  if (order.returnRequest)
    return NextResponse.json(
      { error: "A return request already exists for this order." },
      { status: 409 },
    );

  const returnRequest = await prisma.returnRequest.create({
    data: {
      orderId: order.id,
      userId: session.id,
      reason: parsed.data.reason,
      notes: parsed.data.notes ?? null,
      photos: parsed.data.photos ?? [],
    },
  });

  return NextResponse.json({ data: returnRequest }, { status: 201 });
}
