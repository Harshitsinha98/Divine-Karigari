import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderLifecycleNotification } from "@/lib/order-notification";

const statusFor = (raw: string) => {
  const status = raw.toLowerCase();
  if (status.includes("out for delivery")) return "OUT_FOR_DELIVERY" as const;
  if (status.includes("delivered")) return "DELIVERED" as const;
  if (status.includes("rto") || status.includes("return to origin"))
    return "RTO" as const;
  if (status.includes("returned")) return "RETURNED" as const;
  if (status.includes("cancel")) return "CANCELLED" as const;
  if (status.includes("ship") || status.includes("in transit"))
    return "SHIPPED" as const;
  if (status.includes("confirm")) return "CONFIRMED" as const;
  return "PROCESSING" as const;
};

// Linear progression rank. Exceptions (cancel/rto/returned) can apply anytime;
// otherwise the status may only move forward, never backward.
const STATUS_RANK: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};
const STATUS_EXCEPTIONS = new Set(["CANCELLED", "RTO", "RETURNED"]);

function resolveStatus(
  current: OrderStatus,
  incoming: OrderStatus,
): OrderStatus {
  if (STATUS_EXCEPTIONS.has(incoming)) return incoming;
  const currentRank = STATUS_RANK[current] ?? 0;
  const incomingRank = STATUS_RANK[incoming] ?? 0;
  // Never regress from a terminal/further state.
  return incomingRank >= currentRank ? incoming : current;
}
const titleFor = (status: string) =>
  status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
function authorized(request: Request) {
  const configured = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  if (!configured) return process.env.NODE_ENV !== "production";
  const value =
    request.headers.get("x-shiprocket-token") ??
    request.headers.get("x-api-key") ??
    request.headers.get("authorization")?.replace("Bearer ", "") ??
    "";
  return (
    value.length === configured.length &&
    timingSafeEqual(Buffer.from(value), Buffer.from(configured))
  );
}
export async function POST(request: Request) {
  if (!authorized(request))
    return NextResponse.json(
      { error: "Invalid webhook token" },
      { status: 401 },
    );
  try {
    const payload = await request.json();
    const reference = String(
      payload.order_id ??
        payload.order?.order_id ??
        payload.shipment_id ??
        payload.awb_code ??
        "",
    );
    const rawStatus = String(
      payload.current_status ??
        payload.shipment_status ??
        payload.status ??
        payload.current_status_name ??
        "Processing",
    );
    const incomingStatus = statusFor(rawStatus);
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { shiprocketOrderId: reference },
          { shiprocketShipmentId: reference },
          { awbTrackingNumber: reference },
          { orderNumber: reference },
        ],
      },
      include: { user: true },
    });
    if (!order) return NextResponse.json({ received: true });

    // Guard against backward status transitions (e.g. a late "Processing"
    // event arriving after "Out for delivery").
    const status = resolveStatus(order.status, incomingStatus);
    const statusChanged = status !== order.status;

    const awb = payload.awb_code ?? payload.awb ?? order.awbTrackingNumber;
    const courier =
      payload.courier_name ?? payload.courier_company_name ?? order.courierName;
    const etdValue = payload.etd ?? payload.estimated_delivery_date;
    const deliveredAt = status === "DELIVERED" ? new Date() : order.deliveredAt;
    const applied = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: {
          id: order.id,
          status: { not: "CANCELLED" },
          OR: [
            { shiprocketSyncError: null },
            {
              shiprocketSyncError: {
                not: "Shiprocket cancellation in progress",
              },
            },
          ],
        },
        data: {
          status,
          awbTrackingNumber: awb ? String(awb) : null,
          courierName: courier ? String(courier) : null,
          estimatedDeliveryDate: etdValue
            ? new Date(etdValue)
            : order.estimatedDeliveryDate,
          deliveredAt,
        },
      });
      if (!updated.count) return false;
      // Always log the raw event to the timeline for full tracking history.
      await tx.trackingEvent.create({
        data: {
          orderId: order.id,
          status: incomingStatus,
          title: titleFor(rawStatus),
          description: payload.status_description ?? payload.activity ?? null,
          location: payload.current_location ?? payload.location ?? null,
          rawPayload: payload,
        },
      });
      return true;
    });
    if (!applied) return NextResponse.json({ received: true });
    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { user: true },
    });
    if (!updated) return NextResponse.json({ received: true });
    // Only notify the customer when the order status actually progressed —
    // avoids spamming duplicate/regressed status emails.
    if (statusChanged) {
      const preferences = updated.user.notificationPreferences as {
        orderUpdates?: boolean;
        mobileUpdates?: boolean;
      };
      await sendOrderLifecycleNotification({
        email: preferences.orderUpdates === false ? null : updated.user.email,
        name: updated.user.name,
        phone: preferences.mobileUpdates === true ? updated.user.phone : null,
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        status,
        awb: updated.awbTrackingNumber,
        courier: updated.courierName,
      });
    }

    // ── Handle return shipment tracking ──────────────────────────
    // If this order has a return request, update its tracking too.
    // Shiprocket sends return shipment updates with the same AWB/order reference.
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { orderId: order.id },
    });
    if (
      returnRequest &&
      (returnRequest.status === "APPROVED" ||
        returnRequest.status === "SHIPPED")
    ) {
      const returnStatus = rawStatus.toLowerCase();
      let newReturnStatus: "APPROVED" | "SHIPPED" | "COMPLETED" =
        returnRequest.status as "APPROVED" | "SHIPPED";
      if (
        returnStatus.includes("pickup") ||
        returnStatus.includes("ship") ||
        returnStatus.includes("transit")
      ) {
        newReturnStatus = "SHIPPED";
      } else if (
        returnStatus.includes("delivered") ||
        returnStatus.includes("received")
      ) {
        newReturnStatus = "COMPLETED";
      }
      const returnAwb =
        payload.awb_code ?? payload.awb ?? returnRequest.returnAwb;
      const returnCourier =
        payload.courier_name ??
        payload.courier_company_name ??
        returnRequest.returnCourier;

      await prisma.returnRequest.update({
        where: { id: returnRequest.id },
        data: {
          status: newReturnStatus as "SHIPPED" | "COMPLETED",
          returnAwb: returnAwb ? String(returnAwb) : returnRequest.returnAwb,
          returnCourier: returnCourier
            ? String(returnCourier)
            : returnRequest.returnCourier,
          trackingEvents: {
            create: {
              status: newReturnStatus,
              title: `Return: ${titleFor(rawStatus)}`,
              description:
                payload.status_description ?? payload.activity ?? null,
              location: payload.current_location ?? payload.location ?? null,
              rawPayload: payload,
            },
          },
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to process Shiprocket status update" },
      { status: 500 },
    );
  }
}
