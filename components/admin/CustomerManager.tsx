"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  walletBalance: number;
  lifetimeValue: number;
  _count: { orders: number; addresses: number };
};

export function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/customers?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((payload) => setCustomers(payload.data ?? []))
      .catch(() => undefined);
    return () => controller.abort();
  }, [query]);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
        Relationships
      </p>
      <h1 className="mt-2 font-display text-4xl">Customers</h1>
      <input
        className="mt-7 h-11 w-full max-w-md rounded-soft border border-sand-line bg-parchment px-3 text-sm"
        placeholder="Search name, email or phone"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="mt-5 overflow-x-auto rounded-soft-xl border border-sand-line bg-parchment">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-sand-line bg-sand-line/20 text-xs uppercase text-muted-ink">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Lifetime value</th>
              <th className="p-4">Wallet</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-sand-line/70 last:border-0"
              >
                <td className="p-4">
                  <p className="font-medium">{customer.name ?? "Unnamed"}</p>
                  <p className="text-xs text-muted-ink">
                    {customer.email}
                    {customer.phone ? ` · ${customer.phone}` : ""}
                  </p>
                </td>
                <td className="p-4">
                  {new Date(customer.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="p-4">{customer._count.orders}</td>
                <td className="p-4">
                  ₹{customer.lifetimeValue.toLocaleString("en-IN")}
                </td>
                <td className="p-4">
                  ₹{customer.walletBalance.toLocaleString("en-IN")}
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-oxblood"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!customers.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-ink">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
