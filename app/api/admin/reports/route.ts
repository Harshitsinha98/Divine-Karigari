import { adminError, requireAdmin } from "@/lib/admin-api";
import { csvResponse, toCsv } from "@/lib/csv-export";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { error } = await requireAdmin(["ORDER_MANAGER"]);
  if (error) return error;
  try {
    const params = new URL(request.url).searchParams;
    const type = params.get("type") === "sales" ? "sales" : "orders";
    const from = params.get("from");
    const to = params.get("to");
    const orders = await prisma.order.findMany({
      where: {
        ...(type === "sales"
          ? { paymentStatus: { in: ["PAID", "PARTIALLY_REFUNDED"] as const } }
          : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
                ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
              },
            }
          : {}),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const csv =
      type === "sales"
        ? toCsv(
            [
              "Date",
              "Order",
              "Customer",
              "Email",
              "Subtotal",
              "Discount",
              "Shipping",
              "GST",
              "Total",
              "Payment status",
            ],
            orders.map((order) => [
              order.createdAt,
              order.orderNumber,
              order.user.name,
              order.user.email,
              Number(order.subtotal),
              Number(order.discount),
              Number(order.shippingFee),
              Number(order.tax),
              Number(order.total),
              order.paymentStatus,
            ]),
          )
        : toCsv(
            [
              "Date",
              "Order",
              "Customer",
              "Email",
              "Phone",
              "Items",
              "Order status",
              "Payment status",
              "Total",
              "Courier",
              "AWB",
            ],
            orders.map((order) => [
              order.createdAt,
              order.orderNumber,
              order.user.name,
              order.user.email,
              order.user.phone,
              order.items.reduce((sum, item) => sum + item.quantity, 0),
              order.status,
              order.paymentStatus,
              Number(order.total),
              order.courierName,
              order.awbTrackingNumber,
            ]),
          );
    return csvResponse(
      `divine-karigari-${type}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
    );
  } catch (caught) {
    return adminError(caught);
  }
}
