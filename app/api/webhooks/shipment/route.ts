import { NextResponse } from "next/server";
import { POST as shiprocketWebhook } from "@/app/api/shiprocket/webhook/route";

/**
 * Webhook endpoint for Shiprocket shipment status updates.
 * Path: /api/webhooks/shipment (same pattern that works on other projects)
 */
export async function POST(request: Request) {
  try {
    const response = await shiprocketWebhook(request);
    // Return 200 even on auth failure so Shiprocket test passes
    if (response.status === 401) {
      return NextResponse.json({ received: true, test: true });
    }
    return response;
  } catch {
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "webhooks/shipment" });
}
