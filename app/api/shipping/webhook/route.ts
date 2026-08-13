/**
 * Alias for the Shiprocket webhook handler.
 * Shiprocket blocks URLs containing "shiprocket" in the path,
 * so this clean URL is used instead: /api/shipping/webhook
 */
export { POST } from "@/app/api/shiprocket/webhook/route";
