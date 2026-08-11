import { absoluteUrl, sendTransactionalEmail } from "@/lib/email";
import { sendOrderMobileNotification } from "@/lib/mobile-notification";
import { escapeHtml } from "@/lib/sanitize";

type LifecycleNotification = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  orderId: string;
  orderNumber: string;
  status: string;
  awb?: string | null;
  courier?: string | null;
};
export async function sendOrderLifecycleNotification(
  notification: LifecycleNotification,
) {
  const trackingUrl = absoluteUrl(
    `/account/orders/${encodeURIComponent(notification.orderId)}`,
  );
  const label = notification.status.replaceAll("_", " ").toLowerCase();
  const delivered = notification.status === "DELIVERED";
  const heading = delivered
    ? "Your gift has been delivered."
    : `Your order is ${label}.`;
  const tracking = notification.awb
    ? `<p style="margin:14px 0 0">Tracking: <strong>${escapeHtml(
        notification.awb,
      )}</strong>${notification.courier ? ` via ${escapeHtml(notification.courier)}` : ""}</p>`
    : "";
  const notifications: Promise<unknown>[] = [
    sendOrderMobileNotification({
      phone: notification.phone,
      orderNumber: notification.orderNumber,
      status: notification.status,
      trackingUrl,
    }),
  ];
  if (notification.email)
    notifications.push(
      sendTransactionalEmail({
        to: notification.email,
        subject: delivered
          ? `Order ${notification.orderNumber} has been delivered`
          : `Order ${notification.orderNumber}: ${label}`,
        preheader: `An update for order ${notification.orderNumber}.`,
        heading,
        body: `<p style="margin:0">Order <strong>${escapeHtml(
          notification.orderNumber,
        )}</strong> has a new delivery update.</p>${tracking}`,
        action: { label: "Track your order", url: trackingUrl },
      }),
    );
  const results = await Promise.allSettled(notifications);
  results.forEach((result) => {
    if (result.status === "rejected")
      console.error("[order-lifecycle-notification]", result.reason);
  });
  return results;
}
