"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  total: number;
  user: { name: string | null; email: string };
  _count: { items: number };
};
export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1, total: 0 });
  useEffect(() => {
    fetch(
      `/api/admin/orders?q=${encodeURIComponent(q)}&status=${status}&paymentStatus=${paymentStatus}&page=${page}`,
    )
      .then((res) => res.json())
      .then((res) => {
        setOrders(res.data ?? []);
        setMeta(res.meta ?? { pages: 1, total: 0 });
      });
  }, [q, status, paymentStatus, page]);
  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
          Fulfilment
        </p>
        <h1 className="mt-2 font-display text-4xl">Orders</h1>
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <input
          className="h-11 min-w-64 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
          placeholder="Order number or customer"
          value={q}
          onChange={(event) => {
            setPage(1);
            setQ(event.target.value);
          }}
        />
        <select
          className="h-11 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
        >
          <option value="">All order statuses</option>
          {[
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
            "RETURNED",
            "RTO",
          ].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className="h-11 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
          value={paymentStatus}
          onChange={(event) => {
            setPage(1);
            setPaymentStatus(event.target.value);
          }}
        >
          <option value="">All payments</option>
          {["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"].map(
            (item) => (
              <option key={item}>{item}</option>
            ),
          )}
        </select>
      </div>
      <div className="mt-5 overflow-x-auto rounded-soft-xl border border-sand-line bg-parchment">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-sand-line bg-sand-line/20 text-xs uppercase text-muted-ink">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                className="border-b border-sand-line/70 last:border-0"
                key={order.id}
              >
                <td className="p-4 font-medium">
                  {order.orderNumber}
                  <p className="mt-1 text-xs font-normal text-muted-ink">
                    {order._count.items} item(s)
                  </p>
                </td>
                <td className="p-4">{order.user.name ?? order.user.email}</td>
                <td className="p-4">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="p-4 text-xs">{order.paymentStatus}</td>
                <td className="p-4">
                  <span className="rounded-full bg-sand-line/50 px-2 py-1 text-xs">
                    {order.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td className="p-4">₹{order.total.toLocaleString("en-IN")}</td>
                <td className="p-4 text-right">
                  <Link
                    className="text-oxblood"
                    href={`/admin/orders/${order.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td className="p-8 text-center text-muted-ink" colSpan={7}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-ink">{meta.total} orders</span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-soft border border-sand-line px-3 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled={page >= meta.pages}
            onClick={() => setPage(page + 1)}
            className="rounded-soft border border-sand-line px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
