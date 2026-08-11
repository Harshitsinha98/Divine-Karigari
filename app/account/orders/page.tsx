import Link from "next/link";
import { AccountSection } from "@/components/account/AccountSection";
import { StatusBadge } from "@/components/account/StatusBadge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function OrdersPage() {
  const session = await getSessionUser();
  if (!session) return null;
  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <AccountSection eyebrow="Your history" title="My orders">
        <p className="mt-4 text-sm leading-7 text-muted-ink">
          Every meaningful delivery, in one place.
        </p>
      </AccountSection>
      <div className="mt-10 grid gap-3">
        {orders.length ? (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="grid gap-4 rounded-soft-xl border border-sand-line p-5 transition hover:border-gold sm:grid-cols-[1fr_auto_auto] sm:items-center"
            >
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-muted-ink">
                  Placed {order.createdAt.toLocaleDateString("en-IN")}
                </p>
              </div>
              <StatusBadge status={order.status} />
              <p className="text-sm font-medium">
                ₹{Number(order.total).toLocaleString("en-IN")}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-ink">
            No orders yet.{" "}
            <Link href="/shop" className="text-oxblood">
              Start exploring →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
