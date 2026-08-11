import Link from "next/link";
import { ArrowUpRight, Heart, WalletCards } from "lucide-react";
import { AccountCard } from "@/components/account/AccountSection";
import { StatusBadge } from "@/components/account/StatusBadge";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function AccountOverview() {
  const session = await getSessionUser();
  if (!session) return null;
  const [user, orders, wallet, wishlist] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true },
    }),
    prisma.order.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.wallet.findUnique({ where: { userId: session.id } }),
    prisma.wishlist.findUnique({
      where: { userId: session.id },
      include: { _count: { select: { items: true } } },
    }),
  ]);
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Overview</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">
        Good to see you, {user?.name?.split(" ")[0] ?? "there"}.
      </h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <AccountCard>
          <WalletCards className="text-gold" size={21} />
          <p className="mt-5 text-sm text-muted-ink">Wallet balance</p>
          <p className="mt-1 font-display text-3xl">
            ₹{Number(wallet?.balance ?? 0).toLocaleString("en-IN")}
          </p>
        </AccountCard>
        <AccountCard>
          <Heart className="text-gold" size={21} />
          <p className="mt-5 text-sm text-muted-ink">Wishlist</p>
          <p className="mt-1 font-display text-3xl">
            {wishlist?._count.items ?? 0}{" "}
            <span className="text-base text-muted-ink">saved</span>
          </p>
        </AccountCard>
        <AccountCard>
          <ArrowUpRight className="text-gold" size={21} />
          <p className="mt-5 text-sm text-muted-ink">Orders</p>
          <p className="mt-1 font-display text-3xl">{orders.length}</p>
        </AccountCard>
      </div>
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-3xl">Recent orders</h2>
          <Link
            href="/account/orders"
            className="text-sm text-oxblood hover:text-gold"
          >
            View all →
          </Link>
        </div>
        <div className="mt-5 grid gap-3">
          {orders.length ? (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-soft border border-sand-line p-4 hover:border-gold"
              >
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted-ink">
                    {order.createdAt.toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-sm">
                    ₹{Number(order.total).toLocaleString("en-IN")}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <AccountCard>
              <p className="text-sm text-muted-ink">
                Your first thoughtful order will appear here.
              </p>
              <Link
                href="/shop"
                className="mt-3 inline-block text-sm text-oxblood"
              >
                Explore gifts →
              </Link>
            </AccountCard>
          )}
        </div>
      </div>
    </div>
  );
}
