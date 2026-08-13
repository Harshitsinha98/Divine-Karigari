import { NextResponse } from "next/server";
import { POST as shiprocketWebhook } from "@/app/api/shiprocket/webhook/route";

/**
 * Alias for the Shiprocket webhook handler.
 * Shiprocket blocks URLs containing "shiprocket" in the path,
 * so this clean URL is used: /api/shipping/webhook
 */
export async function POST(request: Request) {
  try {
    return await shiprocketWebhook(request);
  } catch {
    return NextResponse.json({ received: true });
  }
}

// Allow GET for health-check / testing endpoint availability
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "shipping-webhook" });
}
