import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AccountSection,
  AccountCard,
} from "@/components/account/AccountSection";
import { ReorderButton } from "@/components/account/ReorderButton";
import { StatusBadge } from "@/components/account/StatusBadge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestReturnButton } from "@/components/account/RequestReturnButton";
const steps = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];
const stepLabels: Record<string, string> = {
  PENDING: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};
export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionUser();
  if (!session) return null;
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.id },
    include: {
      items: { include: { product: true } },
      trackingEvents: { orderBy: { happenedAt: "desc" } },
      returnRequest: true,
    },
  });
  if (!order) notFound();
  const current =
    order.status === "PROCESSING"
      ? 1
      : Math.max(0, steps.indexOf(order.status));
  const returnWindowDays = Number(process.env.RETURN_WINDOW_DAYS ?? 7);
  const returnEligible =
    order.status === "DELIVERED" &&
    Date.now() <=
      (order.deliveredAt ?? order.updatedAt).getTime() +
        returnWindowDays * 86400000;
  const reorderItems = order.items.map((item) => ({
    productId: item.productId,
    slug: item.product.slug,
    name: item.productName,
    image: item.product.images[0],
    price: Number(item.unitPrice),
    quantity: item.quantity,
    stock: item.product.stock,
  }));
  return (
    <div>
      <Link href="/account/orders" className="text-sm text-oxblood">
        ← All orders
      </Link>
      <div className="mt-8">
        <AccountSection eyebrow={order.orderNumber} title="Order details">
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <StatusBadge status={order.status} />
            <span className="text-sm text-muted-ink">
              {order.createdAt.toLocaleDateString("en-IN")}
            </span>
          </div>
        </AccountSection>
      </div>
      <AccountCard className="mt-10">
        <h2 className="font-display text-2xl">Tracking</h2>
        <div className="mt-8 grid grid-cols-3 gap-y-7 sm:grid-cols-6">
          {steps.map((step, index) => (
            <div key={step} className="relative text-center">
              <span
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-xs ${index <= current ? "border-gold bg-gold text-parchment" : "border-sand-line text-muted-ink"}`}
              >
                {index + 1}
              </span>
              <p className="mt-2 text-[10px] capitalize text-muted-ink">
                {stepLabels[step]}
              </p>
            </div>
          ))}
        </div>
        {order.awbTrackingNumber && (
          <div className="mt-6 border-t border-sand-line pt-4 text-sm text-muted-ink">
            <p>
              AWB tracking number:{" "}
              <span className="font-medium text-ink">
                {order.awbTrackingNumber}
              </span>
            </p>
            {order.courierName && (
              <p className="mt-2">
                Courier:{" "}
                <span className="font-medium text-ink">
                  {order.courierName}
                </span>
              </p>
            )}
            {order.estimatedDeliveryDate && (
              <p className="mt-2">
                Estimated delivery:{" "}
                <span className="font-medium text-ink">
                  {order.estimatedDeliveryDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </p>
            )}
          </div>
        )}
        {order.trackingEvents.length > 0 && (
          <div className="mt-6 border-t border-sand-line pt-5">
            <p className="text-xs uppercase tracking-[0.16em] text-gold">
              Live updates
            </p>
            <div className="mt-4 grid gap-4">
              {order.trackingEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="flex gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="font-medium">{event.title}</p>
                    {event.description && (
                      <p className="mt-1 text-muted-ink">{event.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-ink">
                      {event.location ? `${event.location} · ` : ""}
                      {event.happenedAt.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AccountCard>
      <AccountCard className="mt-5">
        <h2 className="font-display text-2xl">Items</h2>
        <div className="mt-5 grid gap-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 border-t border-sand-line pt-4 text-sm"
            >
              <span>
                {item.productName} × {item.quantity}
                {item.customization && (
                  <small className="block text-muted-ink">
                    “{item.customization}”
                  </small>
                )}
              </span>
              <span>
                ₹
                {(Number(item.unitPrice) * item.quantity).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-sand-line pt-4 font-medium">
          <span>Total</span>
          <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ReorderButton items={reorderItems} />
          <a
            href={`/api/account/orders/${order.id}/invoice`}
            download
            className="inline-flex min-h-11 items-center rounded-soft border border-sand-line px-5 text-sm hover:border-gold hover:text-gold"
          >
            Download invoice
          </a>
          {returnEligible && !order.returnRequest && (
            <RequestReturnButton orderId={order.id} />
          )}
          {order.returnRequest && (
            <span className="inline-flex min-h-11 items-center rounded-soft border border-sand-line px-4 text-sm text-muted-ink">
              Return request: {order.returnRequest.status.toLowerCase()}
            </span>
          )}
        </div>
      </AccountCard>
    </div>
  );
}
