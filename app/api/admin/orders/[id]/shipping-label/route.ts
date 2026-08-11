import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
type Context = { params: { id: string } };
const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
export async function GET(_: Request, { params }: Context) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: true, items: true },
  });
  if (!order) return new Response("Order not found", { status: 404 });
  const a = order.shippingAddress as {
    recipientName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phone?: string;
  };
  const html = `<!doctype html><html><head><title>Shipping label ${esc(order.orderNumber)}</title><style>body{font-family:Arial;color:#111;margin:24px}.label{max-width:600px;border:2px solid #111;padding:28px}h1{margin:0 0 20px;font-size:26px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;border-top:1px solid #111;padding-top:16px}.awb{margin-top:30px;border-top:2px solid #111;padding-top:16px;font-size:20px;font-weight:bold}small{color:#555}@media print{body{margin:0}.label{border:0}}</style></head><body><div class="label"><h1>Divine Karigari</h1><div class="grid"><div><small>SHIP TO</small><p><strong>${esc(a.recipientName)}</strong><br>${esc(a.line1)}<br>${esc(a.line2)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.postalCode)}<br>Ph: ${esc(a.phone)}</p></div><div><small>ORDER</small><p><strong>${esc(order.orderNumber)}</strong><br>${order.items.length} item(s)<br>${esc(order.paymentStatus)}</p></div></div><div class="awb">AWB: ${esc(order.awbTrackingNumber ?? "Awaiting courier assignment")}<br><small>${esc(order.courierName ?? "Shiprocket")}</small></div></div><script>window.onload=()=>window.print()</script></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
