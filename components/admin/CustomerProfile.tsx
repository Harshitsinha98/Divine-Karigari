"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  addresses: {
    id: string;
    label: string;
    recipientName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  wallet: {
    balance: number;
    transactions: {
      id: string;
      type: string;
      amount: number;
      description: string;
      createdAt: string;
    }[];
  } | null;
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
  }[];
};

export function CustomerProfile({ initial }: { initial: Customer }) {
  const [customer, setCustomer] = useState(initial);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("Goodwill credit");
  const [notice, setNotice] = useState("");
  const credit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch(`/api/admin/customers/${customer.id}/wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), reason }),
    });
    const payload = await response.json();
    if (!response.ok) return setNotice(payload.error ?? "Credit failed.");
    setCustomer((current) => ({
      ...current,
      wallet: {
        balance: Number(payload.data.balance),
        transactions: payload.data.transactions,
      },
    }));
    setAmount("");
    setNotice("Wallet credit added.");
  };
  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-oxblood">
        ← Back to customers
      </Link>
      <div className="mt-3">
        <p className="text-xs uppercase tracking-[.16em] text-oxblood">
          Customer profile
        </p>
        <h1 className="mt-2 font-display text-4xl">
          {customer.name ?? "Unnamed customer"}
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          {customer.email}
          {customer.phone ? ` · ${customer.phone}` : ""}
        </p>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_380px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-soft-xl border border-sand-line bg-parchment">
            <h2 className="border-b border-sand-line p-5 font-display text-2xl">
              Orders
            </h2>
            <div className="divide-y divide-sand-line">
              {customer.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-sand-line/20"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-ink">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")} ·{" "}
                      {order.status.replaceAll("_", " ")}
                    </p>
                  </div>
                  <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
                </Link>
              ))}
              {!customer.orders.length && (
                <p className="p-5 text-sm text-muted-ink">No orders yet.</p>
              )}
            </div>
          </section>
          <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
            <h2 className="font-display text-2xl">Saved addresses</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {customer.addresses.map((address) => (
                <div
                  key={address.id}
                  className="rounded-soft border border-sand-line p-4 text-sm"
                >
                  <p className="font-medium">
                    {address.label}
                    {address.isDefault ? " · Default" : ""}
                  </p>
                  <p className="mt-2 text-muted-ink">
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
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <form
            onSubmit={credit}
            className="rounded-soft-xl border border-sand-line bg-parchment p-5"
          >
            <h2 className="font-display text-2xl">Wallet</h2>
            <p className="mt-2 font-display text-3xl">
              ₹{Number(customer.wallet?.balance ?? 0).toLocaleString("en-IN")}
            </p>
            {notice && <p className="mt-3 text-sm text-tulsi">{notice}</p>}
            <input
              required
              min="1"
              max="100000"
              type="number"
              className="mt-4 h-11 w-full rounded-soft border border-sand-line px-3 text-sm"
              placeholder="Goodwill credit amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <input
              required
              className="mt-3 h-11 w-full rounded-soft border border-sand-line px-3 text-sm"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <button className="mt-3 min-h-10 rounded-soft bg-ink px-4 text-sm text-parchment">
              Add credit
            </button>
          </form>
          <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
            <h2 className="font-display text-2xl">Wallet history</h2>
            <div className="mt-4 space-y-3">
              {customer.wallet?.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <div>
                    <p>{transaction.description}</p>
                    <p className="text-xs text-muted-ink">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                  <span>
                    ₹{Number(transaction.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
