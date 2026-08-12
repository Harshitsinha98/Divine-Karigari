import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { trackShiprocketAwb } from "@/lib/shiprocket";

/**
 * PUBLIC order tracking — no auth needed.
 * Looks up an order by order number + (email OR AWB) and returns
 * its status, tracking events, and live Shiprocket tracking if available.
 */
const schema = z.object({
  orderNumber: z.string().trim().min(3).max(50),
  identifier: z.string().trim().min(3).max(254), // email or AWB or phone
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter your order number and email/AWB." },
      { status: 400 },
    );

  const { orderNumber, identifier } = parsed.data;
  const id = identifier.toLowerCase();

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      OR: [
        { user: { email: id } },
        { awbTrackingNumber: identifier },
        { user: { phone: identifier } },
      ],
    },
    include: {
      items: { select: { productName: true, quantity: true } },
      trackingEvents: { orderBy: { happenedAt: "desc" } },
    },
  });

  if (!order)
    return NextResponse.json(
      { error: "No order found. Check your order number and email/AWB." },
      { status: 404 },
    );

  // Fetch live Shiprocket tracking if AWB exists
  let liveTracking = null;
  if (order.awbTrackingNumber) {
    liveTracking = await trackShiprocketAwb(order.awbTrackingNumber);
  }

  return NextResponse.json({
    data: {
      orderNumber: order.orderNumber,
      status: order.status,
      awb: order.awbTrackingNumber,
      courier: order.courierName,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      deliveredAt: order.deliveredAt,
      items: order.items,
      events: order.trackingEvents.map((e) => ({
        status: e.status,
        title: e.title,
        description: e.description,
        location: e.location,
        happenedAt: e.happenedAt,
      })),
      live: liveTracking,
    },
  });
}
