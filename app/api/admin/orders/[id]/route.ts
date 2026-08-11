import { NextResponse } from "next/server";
import { z } from "zod";
import { adminError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

const optionalClean = (maximum: number) =>
  z
    .string()
    .trim()
    .transform((value) => sanitizeText(value, maximum))
    .pipe(z.string().max(maximum))
    .optional();

const orderRoles = ["ORDER_MANAGER"] as const;
const updateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "RTO",
  ]),
  note: optionalClean(500),
  location: optionalClean(160),
});
type Context = { params: { id: string } };
const title: Record<string, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Order confirmed",
  PROCESSING: "Order is being prepared",
  SHIPPED: "Order shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Order cancelled",
  RETURNED: "Returned",
  RTO: "Returned to origin",
};
const include = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  items: { include: { product: { select: { images: true } }, variant: true } },
  payments: true,
  refunds: {
    include: {
      staff: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" as const },
  },
  trackingEvents: { orderBy: { happenedAt: "asc" as const } },
  returnRequest: true,
};

export async function GET(_: Request, { params }: Context) {
  const { error } = await requireAdmin(orderRoles);
  if (error) return error;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include,
  });
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ data: order });
}
export async function PUT(request: Request, { params }: Context) {
  const { error } = await requireAdmin(orderRoles);
  if (error) return error;
  try {
    const input = updateSchema.parse(await request.json());
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: input.status,
        deliveredAt: input.status === "DELIVERED" ? new Date() : undefined,
        trackingEvents: {
          create: {
            status: input.status,
            title: title[input.status],
            description: input.note,
            location: input.location,
          },
        },
      },
      include,
    });
    return NextResponse.json({ data: order });
  } catch (caught) {
    return adminError(caught);
  }
}
