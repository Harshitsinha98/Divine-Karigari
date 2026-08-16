import "server-only";
import { escapeHtml } from "@/lib/sanitize";

type EmailInput = {
  to: string;
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  action?: { label: string; url: string };
};

const appUrl = () =>
  (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

export function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${appUrl()}${path}`;
}

function emailHtml(input: EmailInput) {
  const action = input.action
    ? `<tr><td style="padding:8px 32px 32px"><a href="${escapeHtml(
        input.action.url,
      )}" style="display:inline-block;background:#0E7C6F;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:600">${escapeHtml(
        input.action.label,
      )}</a></td></tr>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(
    input.subject,
  )}</title></head><body style="margin:0;background:#ffffff;color:#15302B;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(
    input.preheader,
  )}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;padding:24px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #E3E8E6;border-radius:12px;overflow:hidden"><tr><td style="padding:28px 32px;border-bottom:1px solid #E3E8E6"><div style="font-family:Georgia,serif;font-size:26px;color:#0E7C6F">Divine <span style="color:#E11D74">Karigari</span></div><div style="margin-top:5px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5C6B66">Thoughtful gifts, beautifully made</div></td></tr><tr><td style="padding:32px 32px 12px"><h1 style="margin:0;font-family:Georgia,serif;font-size:32px;line-height:1.2;font-weight:500">${escapeHtml(
    input.heading,
  )}</h1></td></tr><tr><td style="padding:8px 32px 24px;font-size:15px;line-height:1.75;color:#5C6B66">${input.body}</td></tr>${action}<tr><td style="padding:22px 32px;border-top:1px solid #E3E8E6;font-size:12px;line-height:1.6;color:#5C6B66">Divine Karigari, India<br><a href="${appUrl()}" style="color:#0E7C6F">${appUrl()}</a></td></tr></table></td></tr></table></body></html>`;
}

function emailText(input: EmailInput) {
  const bodyText = input.body
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const action = input.action
    ? `\n\n${input.action.label}: ${input.action.url}`
    : "";
  return `${input.heading}\n\n${bodyText}${action}\n\n— Divine Karigari\n${appUrl()}`;
}

export async function sendTransactionalEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "Divine Karigari <orders@divinekarigari.in>";
  if (!apiKey) {
    console.info("[email-preview]", {
      to: input.to,
      subject: input.subject,
      action: input.action?.url,
    });
    return { sent: false, reason: "RESEND_API_KEY is not configured." };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      reply_to: process.env.EMAIL_REPLY_TO,
      subject: input.subject,
      html: emailHtml(input),
      text: emailText(input),
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      payload.message ?? `Email provider returned ${response.status}.`,
    );
  return { sent: true, id: payload.id as string | undefined };
}
