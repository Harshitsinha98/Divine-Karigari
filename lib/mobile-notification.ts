import "server-only";

type OrderMessage = {
  phone?: string | null;
  orderNumber: string;
  status: string;
  trackingUrl: string;
};

function normalizeIndianMobile(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits.length >= 10 ? digits : null;
}

async function sendMsg91(message: OrderMessage, mobile: string) {
  if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_FLOW_ID) return false;
  const response = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      authkey: process.env.MSG91_AUTH_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: process.env.MSG91_FLOW_ID,
      short_url: "0",
      recipients: [
        {
          mobiles: mobile,
          ORDER_NUMBER: message.orderNumber,
          STATUS: message.status.replaceAll("_", " "),
          TRACKING_URL: message.trackingUrl,
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`MSG91 returned ${response.status}.`);
  return true;
}

async function sendGupshup(message: OrderMessage, mobile: string) {
  const templateId = process.env.GUPSHUP_ORDER_TEMPLATE_ID;
  if (
    !process.env.GUPSHUP_API_KEY ||
    !process.env.GUPSHUP_APP_NAME ||
    !process.env.GUPSHUP_SOURCE_NUMBER ||
    !templateId
  )
    return false;
  const body = new URLSearchParams({
    channel: "whatsapp",
    source: process.env.GUPSHUP_SOURCE_NUMBER,
    destination: mobile,
    "src.name": process.env.GUPSHUP_APP_NAME,
    template: JSON.stringify({
      id: templateId,
      params: [
        message.orderNumber,
        message.status.replaceAll("_", " "),
        message.trackingUrl,
      ],
    }),
  });
  const response = await fetch(
    "https://api.gupshup.io/wa/api/v1/template/msg",
    {
      method: "POST",
      headers: {
        apikey: process.env.GUPSHUP_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );
  if (!response.ok) throw new Error(`Gupshup returned ${response.status}.`);
  return true;
}

export async function sendOrderMobileNotification(message: OrderMessage) {
  const mobile = normalizeIndianMobile(message.phone);
  if (!mobile) return { sms: false, whatsapp: false };
  const results = await Promise.allSettled([
    sendMsg91(message, mobile),
    sendGupshup(message, mobile),
  ]);
  results.forEach((result) => {
    if (result.status === "rejected")
      console.error("[mobile-notification]", result.reason);
  });
  return {
    sms: results[0].status === "fulfilled" && results[0].value,
    whatsapp: results[1].status === "fulfilled" && results[1].value,
  };
}
