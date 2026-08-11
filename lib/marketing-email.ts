import { absoluteUrl, sendTransactionalEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/sanitize";

type CartReminder = {
  email: string;
  name?: string | null;
  items: { name: string; quantity: number; price: number }[];
};

export async function sendAbandonedCartEmail(reminder: CartReminder) {
  const rows = reminder.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0">${escapeHtml(item.name)} × ${item.quantity}</td><td style="padding:8px 0;text-align:right">₹${(
          item.price * item.quantity
        ).toLocaleString("en-IN")}</td></tr>`,
    )
    .join("");
  return sendTransactionalEmail({
    to: reminder.email,
    subject: "Your thoughtful gifts are still waiting",
    preheader: "Return to your Divine Karigari cart.",
    heading: `Still deciding${reminder.name ? `, ${reminder.name.split(" ")[0]}` : ""}?`,
    body: `<p style="margin:0 0 16px">The pieces you chose are still in your cart.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #DFCFAE;border-bottom:1px solid #DFCFAE">${rows}</table>`,
    action: { label: "Return to your cart", url: absoluteUrl("/cart") },
  });
}

export async function sendNewsletterWelcome(email: string) {
  return sendTransactionalEmail({
    to: email,
    subject: "Welcome to The Gifting Note",
    preheader: "Maker stories and thoughtful gifting ideas, occasionally.",
    heading: "You are on the list.",
    body: '<p style="margin:0">We will share first looks, maker stories, festival edits, and thoughtful gifting ideas. Quietly and occasionally.</p>',
    action: { label: "Explore the collection", url: absoluteUrl("/shop") },
  });
}

export async function syncResendNewsletterContact(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const response = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  if (response.status === 409) {
    const update = await fetch(
      `https://api.resend.com/contacts/${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ unsubscribed: false }),
      },
    );
    if (!update.ok)
      throw new Error(`Newsletter provider returned ${update.status}.`);
  } else if (!response.ok) {
    throw new Error(`Newsletter provider returned ${response.status}.`);
  }
  const segmentId = process.env.RESEND_SEGMENT_ID;
  if (segmentId) {
    const segment = await fetch(
      `https://api.resend.com/contacts/${encodeURIComponent(
        email,
      )}/segments/${encodeURIComponent(segmentId)}`,
      { method: "POST", headers },
    );
    if (!segment.ok && segment.status !== 409)
      throw new Error(`Newsletter segment returned ${segment.status}.`);
  }
  return true;
}
