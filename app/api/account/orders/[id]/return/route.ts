import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
const schema = z.object({
  reason: z
    .string()
    .trim()
    .min(3)
    .max(500)
    .transform((value) => sanitizeText(value, 500)),
  notes: z
    .string()
    .trim()
    .max(1000)
    .transform((value) => sanitizeText(value, 1000))
    .optional(),
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
      { error: "Please tell us why you would like to return this order." },
      { status: 400 },
    );
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.id },
  });
  const windowDays = Number(process.env.RETURN_WINDOW_DAYS ?? 7);
  const deliveredAt = order?.deliveredAt ?? order?.updatedAt;
  if (
    !order ||
    order.status !== "DELIVERED" ||
    !deliveredAt ||
    Date.now() > deliveredAt.getTime() + windowDays * 86400000
  )
    return NextResponse.json(
      {
        error: `Returns can be requested within ${windowDays} days of delivery.`,
      },
      { status: 400 },
    );
  const returnRequest = await prisma.returnRequest.upsert({
    where: { orderId: order.id },
    update: {
      reason: parsed.data.reason,
      notes: parsed.data.notes,
      status: "REQUESTED",
    },
    create: {
      orderId: order.id,
      userId: session.id,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
    },
  });
  return NextResponse.json({ data: returnRequest }, { status: 201 });
}
