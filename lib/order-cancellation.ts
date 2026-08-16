import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cancelShiprocketOrder } from "@/lib/shiprocket";
import { sendOrderLifecycleNotification } from "@/lib/order-notification";

const cancellationInProgress = "Shiprocket cancellation in progress";
const cancellableStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
];

const pickupEvidencePattern =
  /picked\s*up|in\s*transit|out\s*for\s*delivery|delivered|rto|return\s*to\s*origin/;

type CancelledBy = "CUSTOMER" | "ADMIN";

export class OrderCancellationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderCancellationError";
  }
}

function hasLocalPickupEvidence(
  events: { title: string; description: string | null; rawPayload: unknown }[],
) {
  return events.some((event) => {
    const eventText = [
      event.title,
      event.description,
      JSON.stringify(event.rawPayload ?? {}),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replaceAll("_", " ");
    return pickupEvidencePattern.test(eventText);
  });
}

export async function cancelOrder(orderId: string, cancelledBy: CancelledBy) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      trackingEvents: {
        select: { title: true, description: true, rawPayload: true },
      },
    },
  });
  if (!order) throw new OrderCancellationError("Order not found.");
  if (order.status === "CANCELLED") {
    throw new OrderCancellationError("This order is already cancelled.");
  }
  if (!cancellableStatuses.includes(order.status)) {
    throw new OrderCancellationError(
      "This order can no longer be cancelled because fulfilment has progressed beyond pickup.",
    );
  }
  if (order.shiprocketSyncError === "Shiprocket sync in progress") {
    throw new OrderCancellationError(
      "Shipping is being set up for this order. Please retry cancellation in a moment.",
    );
  }
  if (hasLocalPickupEvidence(order.trackingEvents)) {
    throw new OrderCancellationError(
      "This shipment has already been picked up and cannot be cancelled.",
    );
  }

  // Persist a durable intent before making the external call. This blocks
  // Shiprocket re-sync / AWB assignment from progressing if the request times
  // out after Shiprocket has already accepted the cancellation.
  const claimed = await prisma.order.updateMany({
    where: {
      id: order.id,
      status: { in: cancellableStatuses },
      OR: [
        { shiprocketSyncError: null },
        {
          shiprocketSyncError: {
            not: "Shiprocket sync in progress",
          },
        },
      ],
    },
    data: { shiprocketSyncError: cancellationInProgress },
  });
  if (!claimed.count) {
    throw new OrderCancellationError(
      "Cancellation is already being processed or this order has changed. Please refresh and try again.",
    );
  }

  try {
    // Shiprocket is the source of truth for a created courier shipment. It
    // verifies live pickup state and declines cancellation after physical pickup.
    await cancelShiprocketOrder(
      order.shiprocketOrderId,
      order.awbTrackingNumber,
    );
  } catch (caught) {
    // Keep the durable cancellation intent in place. A retry resumes the same
    // cancellation instead of allowing the order to be fulfilled again.
    throw new OrderCancellationError(
      caught instanceof Error
        ? caught.message
        : "Shiprocket cancellation failed.",
    );
  }

  const source = cancelledBy === "CUSTOMER" ? "customer" : "admin";
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        status: { in: cancellableStatuses },
        shiprocketSyncError: cancellationInProgress,
      },
      data: { status: "CANCELLED", shiprocketSyncError: null },
    });
    if (!updated.count) {
      throw new OrderCancellationError(
        "Cancellation is pending reconciliation. Please retry in a moment.",
      );
    }
    await tx.trackingEvent.create({
      data: {
        orderId: order.id,
        status: "CANCELLED",
        title: "Order cancelled",
        description: `Cancelled by ${source} before courier pickup.`,
      },
    });
    return tx.order.findUnique({
      where: { id: order.id },
      include: { user: true },
    });
  });

  // Send cancellation notification to customer
  if (result?.user) {
    const prefs = result.user.notificationPreferences as {
      orderUpdates?: boolean;
      mobileUpdates?: boolean;
    };
    await sendOrderLifecycleNotification({
      email: prefs.orderUpdates === false ? null : result.user.email,
      name: result.user.name,
      phone: prefs.mobileUpdates === true ? result.user.phone : null,
      orderId: result.id,
      orderNumber: result.orderNumber,
      status: "CANCELLED",
      awb: result.awbTrackingNumber,
      courier: result.courierName,
    }).catch((err) =>
      console.error("[cancel-order] Notification failed:", err),
    );
  }

  return result;
}

export function isOrderCancellationUiEligible(status: OrderStatus) {
  return cancellableStatuses.includes(status);
}
