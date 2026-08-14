import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderActions } from "@/components/admin/OrderActions";
export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: true,
      payments: true,
      refunds: { orderBy: { createdAt: "desc" } },
      trackingEvents: { orderBy: { happenedAt: "asc" } },
    },
  });
  if (!order) notFound();
  const address = order.shippingAddress as {
    recipientName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phone?: string;
  };
  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-oxblood">
        ← Back to orders
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.16em] text-oxblood">
            Order detail
          </p>
          <h1 className="mt-2 font-display text-4xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-ink">
            {order.createdAt.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            target="_blank"
            rel="noreferrer"
            href={`/api/admin/orders/${order.id}/invoice`}
            className="rounded-soft border border-sand-line px-3 py-2 text-sm"
          >
            Print invoice
          </a>
          <a
            target="_blank"
            rel="noreferrer"
            href={`/api/admin/orders/${order.id}/shipping-label`}
            className="rounded-soft border border-sand-line px-3 py-2 text-sm"
          >
            Shipping label
          </a>
          {order.awbTrackingNumber && order.shiprocketShipmentId && (
            <a
              target="_blank"
              rel="noreferrer"
              href={`/api/admin/orders/${order.id}/manifest`}
              className="rounded-soft border border-sand-line px-3 py-2 text-sm"
            >
              {order.manifestUrl ? "Shiprocket manifest" : "Generate manifest"}
            </a>
          )}
        </div>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_380px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-soft-xl border border-sand-line bg-parchment">
            <div className="border-b border-sand-line p-5">
              <h2 className="font-display text-2xl">Items</h2>
            </div>
            <div className="divide-y divide-sand-line">
              {order.items.map((item) => (
                <div
                  className="flex justify-between gap-4 p-5 text-sm"
                  key={item.id}
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="mt-1 text-xs text-muted-ink">
                      {item.sku} · Qty {item.quantity}
                      {item.customization ? ` · ${item.customization}` : ""}
                    </p>
                  </div>
                  <span>
                    ₹
                    {(Number(item.unitPrice) * item.quantity).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-sand-line p-5 text-sm">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </p>
              <p className="flex justify-between">
                <span>Shipping</span>
                <span>
                  ₹{Number(order.shippingFee).toLocaleString("en-IN")}
                </span>
              </p>
              <p className="flex justify-between font-medium">
                <span>Total</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </p>
            </div>
          </section>
          <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
            <h2 className="font-display text-2xl">Tracking events</h2>
            <div className="mt-4 space-y-4">
              {order.trackingEvents.length ? (
                order.trackingEvents.map((event) => (
                  <div className="border-l-2 border-gold pl-4" key={event.id}>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-ink">
                      {event.happenedAt.toLocaleString("en-IN")}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                    {event.description && (
                      <p className="mt-1 text-sm">{event.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-ink">
                  No tracking events yet.
                </p>
              )}
            </div>
            {(order.awbTrackingNumber || order.shiprocketOrderId) && (
              <p className="mt-5 border-t border-sand-line pt-4 text-sm">
                AWB:{" "}
                <strong>
                  {order.awbTrackingNumber ?? "Awaiting assignment"}
                </strong>
                {order.courierName && ` · ${order.courierName}`}
              </p>
            )}
            {order.shiprocketSyncError &&
              order.shiprocketSyncError !== "Shiprocket sync in progress" && (
                <div className="mt-4 rounded-soft border border-oxblood/20 bg-oxblood/5 p-3 text-sm text-oxblood">
                  <p className="font-medium">Shiprocket sync issue</p>
                  <p className="mt-1 text-xs">{order.shiprocketSyncError}</p>
                  <p className="mt-2 text-xs text-muted-ink">
                    Fix the cause, then click &ldquo;Re-sync Shiprocket&rdquo;
                    in Order actions.
                  </p>
                </div>
              )}
          </section>
        </div>
        <div className="space-y-6">
          <OrderActions
            id={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            total={Number(order.total)}
            awb={order.awbTrackingNumber}
            labelUrl={order.labelUrl}
            manifestUrl={order.manifestUrl}
            hasShipment={Boolean(order.shiprocketShipmentId)}
          />
          <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
            <h2 className="font-display text-2xl">Customer & delivery</h2>
            <p className="mt-4 text-sm font-medium">
              {order.user.name ?? "Guest"}
            </p>
            <p className="text-sm text-muted-ink">
              {order.user.email}
              <br />
              {order.user.phone}
            </p>
            <p className="mt-4 border-t border-sand-line pt-4 text-sm">
              {address.recipientName}
              <br />
              {address.line1}
              <br />
              {address.line2 && (
                <>
                  {address.line2}
                  <br />
                </>
              )}
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.phone}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
