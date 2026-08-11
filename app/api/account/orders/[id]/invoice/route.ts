import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSessionUser();
  if (!session) return new Response("Authentication required", { status: 401 });
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.id },
    include: { items: true },
  });
  if (!order) return new Response("Order not found", { status: 404 });
  const html = `<html><body style="font-family:Arial;padding:40px"><h1>Divine Karigari</h1><h2>Invoice ${order.orderNumber}</h2><p>Status: ${order.status}</p><hr/>${order.items.map((item) => `<p>${item.productName} × ${item.quantity} — ₹${Number(item.unitPrice) * item.quantity}</p>`).join("")}<hr/><h3>Total: ₹${Number(order.total)}</h3></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.html"`,
    },
  });
}
