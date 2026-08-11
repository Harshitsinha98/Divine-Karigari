"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
type Data = {
  revenue: { label: string; value: number }[];
  orderStatuses: { status: string; _count: { _all: number } }[];
  lowStock: { id: string; name: string; sku: string; stock: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    user: { name: string | null; email: string };
  }[];
  topProducts: {
    id: string;
    name: string;
    sku: string;
    salesCount: number;
    stock: number;
  }[];
};
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
export function AdminDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [range, setRange] = useState("daily");
  useEffect(() => {
    fetch(`/api/admin/dashboard?range=${range}`)
      .then((res) => res.json())
      .then((res) => setData(res.data));
  }, [range]);
  if (!data)
    return <p className="text-sm text-muted-ink">Loading dashboard…</p>;
  const total = data.revenue.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...data.revenue.map((item) => item.value), 1);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
            Admin dashboard
          </p>
          <h1 className="mt-2 font-display text-4xl">
            The workshop at a glance
          </h1>
        </div>
        <select
          className="rounded-soft border border-sand-line bg-parchment px-3 py-2 text-sm"
          value={range}
          onChange={(event) => setRange(event.target.value)}
        >
          <option value="daily">Last 30 days</option>
          <option value="weekly">Last 12 weeks</option>
          <option value="monthly">Last 12 months</option>
        </select>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted-ink">Revenue in period</p>
          <p className="mt-2 font-display text-3xl">{money(total)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-ink">Orders</p>
          <p className="mt-2 font-display text-3xl">
            {data.orderStatuses.reduce((sum, row) => sum + row._count._all, 0)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-ink">Low stock alerts</p>
          <p className="mt-2 font-display text-3xl">{data.lowStock.length}</p>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Revenue</h2>
            <span className="text-xs text-muted-ink">Paid orders</span>
          </div>
          <div className="mt-7 flex h-44 items-end gap-1.5">
            {data.revenue.length ? (
              data.revenue.map((item) => (
                <div key={item.label} className="group relative h-full flex-1">
                  <div
                    title={`${item.label}: ${money(item.value)}`}
                    className="absolute bottom-0 w-full rounded-t bg-gold/80 transition hover:bg-oxblood"
                    style={{
                      height: `${Math.max(4, (item.value / max) * 100)}%`,
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="self-center text-sm text-muted-ink">
                No paid orders in this period.
              </p>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-2xl">Low stock</h2>
          <div className="mt-4 space-y-3">
            {data.lowStock.length ? (
              data.lowStock.map((item) => (
                <Link
                  className="flex justify-between text-sm hover:text-oxblood"
                  href={`/admin/products/${item.id}`}
                  key={item.id}
                >
                  <span className="truncate pr-4">{item.name}</span>
                  <span className="font-medium">{item.stock} left</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-ink">Inventory is healthy.</p>
            )}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-sand-line p-5">
            <h2 className="font-display text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-oxblood">
              View all
            </Link>
          </div>
          <div className="divide-y divide-sand-line">
            {data.recentOrders.length ? (
              data.recentOrders.map((order) => (
                <Link
                  href={`/admin/orders/${order.id}`}
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-sand-line/20"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-ink">
                      {order.user.name ?? order.user.email}
                    </p>
                  </div>
                  <span>{money(order.total)}</span>
                </Link>
              ))
            ) : (
              <p className="p-5 text-sm text-muted-ink">
                Order access is limited for this role.
              </p>
            )}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-sand-line p-5">
            <h2 className="font-display text-2xl">Top products</h2>
          </div>
          <div className="divide-y divide-sand-line">
            {data.topProducts.map((item) => (
              <Link
                href={`/admin/products/${item.id}`}
                key={item.id}
                className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-sand-line/20"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-ink">{item.sku}</p>
                </div>
                <span>{item.salesCount} sold</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
