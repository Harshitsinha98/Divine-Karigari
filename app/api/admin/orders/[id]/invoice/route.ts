import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { getShiprocketInvoiceUrl } from "@/lib/shiprocket";
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

  // Shiprocket provides the courier invoice after an order has been created.
  // Keep the branded tax invoice below as a safe fallback for unsynced orders
  // or when Shiprocket has not made its document available yet.
  if (order.shiprocketOrderId) {
    try {
      const invoiceUrl = await getShiprocketInvoiceUrl(order.shiprocketOrderId);
      return NextResponse.redirect(invoiceUrl);
    } catch (error) {
      console.error("[shiprocket] Invoice generation failed:", error);
    }
  }

  const address = order.shippingAddress as {
    recipientName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phone?: string;
  };
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${esc(item.productName)}<br><small>${esc(item.sku)}${item.customization ? ` · ${esc(item.customization)}` : ""}</small></td><td>${item.quantity}</td><td>₹${Number(item.unitPrice).toFixed(2)}</td><td>₹${(Number(item.unitPrice) * item.quantity).toFixed(2)}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><head><title>Invoice ${esc(order.orderNumber)}</title><style>body{font-family:Arial,sans-serif;color:#2b241c;margin:40px}header{display:flex;justify-content:space-between;border-bottom:1px solid #dfcfae;padding-bottom:20px}h1{margin:0;color:#7a2530}table{width:100%;border-collapse:collapse;margin-top:28px}th,td{text-align:left;padding:12px;border-bottom:1px solid #dfcfae}th:last-child,td:last-child{text-align:right}.total{margin:24px 0 0 auto;width:280px}.total p{display:flex;justify-content:space-between}.grand{font-size:18px;font-weight:bold;border-top:1px solid #2b241c;padding-top:10px}@media print{body{margin:18px}}</style></head><body><header><div><h1>Divine Karigari</h1><p>Handcrafted gifts, thoughtfully made.</p></div><div><strong>TAX INVOICE</strong><p>${esc(order.orderNumber)}<br>${order.createdAt.toLocaleDateString("en-IN")}</p></div></header><section><h3>Ship to</h3><p>${esc(address.recipientName)}<br>${esc(address.line1)} ${esc(address.line2)}<br>${esc(address.city)}, ${esc(address.state)} ${esc(address.postalCode)}<br>${esc(address.phone)}</p></section><table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="total"><p><span>Subtotal</span><span>₹${Number(order.subtotal).toFixed(2)}</span></p><p><span>Discount</span><span>−₹${Number(order.discount).toFixed(2)}</span></p><p><span>Shipping</span><span>₹${Number(order.shippingFee).toFixed(2)}</span></p><p><span>GST</span><span>₹${Number(order.tax).toFixed(2)}</span></p><p class="grand"><span>Total</span><span>₹${Number(order.total).toFixed(2)}</span></p></div><script>window.onload=()=>window.print()</script></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
