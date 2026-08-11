import { absoluteUrl, sendTransactionalEmail } from "@/lib/email";
import { sendOrderMobileNotification } from "@/lib/mobile-notification";
import { escapeHtml } from "@/lib/sanitize";

type Confirmation = {
  email: string;
  name?: string | null;
  phone?: string | null;
  orderNumber: string;
  total: number;
};
export async function sendOrderConfirmationEmail(order: Confirmation) {
  try {
    const trackingUrl = absoluteUrl("/account/orders");
    const results = await Promise.allSettled([
      sendTransactionalEmail({
        to: order.email,
        subject: `Order ${order.orderNumber} is confirmed`,
        preheader: "Your Divine Karigari order is confirmed.",
        heading: `Thank you${order.name ? `, ${order.name.split(" ")[0]}` : ""}.`,
        body: `<p style="margin:0 0 14px">We have received your order <strong>${escapeHtml(
          order.orderNumber,
        )}</strong> and your payment is confirmed.</p><p style="margin:0">Order total: <strong>₹${order.total.toLocaleString(
          "en-IN",
        )}</strong>. We will send another update when your gift leaves our workshop.</p>`,
        action: {
          label: "View your order",
          url: trackingUrl,
        },
      }),
      sendOrderMobileNotification({
        phone: order.phone,
        orderNumber: order.orderNumber,
        status: "CONFIRMED",
        trackingUrl,
      }),
    ]);
    results.forEach((result) => {
      if (result.status === "rejected")
        console.error("[order-confirmation-notification]", result.reason);
    });
    return results;
  } catch (error) {
    console.error("[order-confirmation-notification]", error);
    return [];
  }
}
