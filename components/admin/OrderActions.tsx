"use client";
import { useState } from "react";
const statuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "RTO",
];
export function OrderActions({
  id,
  status,
  paymentStatus,
  total,
  awb,
  labelUrl,
}: {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  awb?: string | null;
  labelUrl?: string | null;
}) {
  const [next, setNext] = useState(status);
  const [message, setMessage] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [destination, setDestination] = useState("WALLET");
  const [reason, setReason] = useState("Customer refund");
  const [busy, setBusy] = useState(false);

  const quickStatus = async (target: string) => {
    setBusy(true);
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: target }),
    });
    const result = await response.json();
    setBusy(false);
    setMessage(
      response.ok
        ? `Order marked ${target.replaceAll("_", " ").toLowerCase()}.`
        : (result.error ?? "Update failed."),
    );
    if (response.ok) setNext(target);
  };
  const update = async () => {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const result = await response.json();
    setMessage(
      response.ok
        ? "Order status updated."
        : (result.error ?? "Update failed."),
    );
  };
  const refund = async () => {
    const response = await fetch(`/api/admin/orders/${id}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(refundAmount),
        destination,
        reason,
      }),
    });
    const result = await response.json();
    setMessage(
      response.ok ? "Refund processed." : (result.error ?? "Refund failed."),
    );
    if (response.ok) setRefundAmount("");
  };
  const sync = async () => {
    const response = await fetch(`/api/admin/orders/${id}/shiprocket-sync`, {
      method: "POST",
    });
    const result = await response.json();
    setMessage(
      response.ok
        ? "Shiprocket sync requested."
        : (result.error ?? "Sync failed."),
    );
  };
  return (
    <div className="space-y-5">
      <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
        <h2 className="font-display text-2xl">Order actions</h2>
        {message && <p className="mt-3 text-sm text-tulsi">{message}</p>}
        <label className="mt-4 block text-sm">
          Manual status
          <select
            className="mt-1 h-11 w-full rounded-soft border border-sand-line bg-parchment px-3"
            value={next}
            onChange={(event) => setNext(event.target.value)}
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <button
          onClick={update}
          className="mt-3 min-h-10 rounded-soft bg-ink px-4 text-sm text-parchment"
        >
          Update status
        </button>
        <button
          onClick={sync}
          className="ml-2 min-h-10 rounded-soft border border-sand-line px-4 text-sm"
        >
          Re-sync Shiprocket
        </button>
      </section>

      {/* Fulfilment quick actions */}
      <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
        <h2 className="font-display text-2xl">Fulfilment</h2>
        <p className="mt-1 text-xs text-muted-ink">
          {awb
            ? `AWB ${awb} assigned. Label auto-generates from Shiprocket.`
            : "AWB not assigned yet. Use 'Re-sync Shiprocket' to generate it."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`/api/admin/orders/${id}/shipping-label`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-soft border border-sand-line px-4 text-sm hover:border-gold hover:text-gold"
          >
            {labelUrl ? "Download Shiprocket label" : "Print label"}
          </a>
          <a
            href={`/api/admin/orders/${id}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-soft border border-sand-line px-4 text-sm hover:border-gold hover:text-gold"
          >
            Print invoice
          </a>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-sand-line pt-4">
          <span className="w-full text-xs text-muted-ink">
            Quick status update:
          </span>
          <button
            disabled={busy}
            onClick={() => quickStatus("OUT_FOR_DELIVERY")}
            className="min-h-10 rounded-soft border border-sand-line px-4 text-sm hover:border-gold disabled:opacity-40"
          >
            Out for delivery
          </button>
          <button
            disabled={busy}
            onClick={() => quickStatus("DELIVERED")}
            className="min-h-10 rounded-soft bg-tulsi px-4 text-sm text-parchment disabled:opacity-40"
          >
            Mark delivered
          </button>
        </div>
      </section>
      <section className="rounded-soft-xl border border-sand-line bg-parchment p-5">
        <h2 className="font-display text-2xl">Refund</h2>
        <p className="mt-1 text-xs text-muted-ink">
          Paid status: {paymentStatus} · Maximum available: ₹
          {total.toLocaleString("en-IN")}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="h-11 rounded-soft border border-sand-line px-3 text-sm"
            type="number"
            min="1"
            placeholder="Amount in ₹"
            value={refundAmount}
            onChange={(event) => setRefundAmount(event.target.value)}
          />
          <select
            className="h-11 rounded-soft border border-sand-line px-3 text-sm"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          >
            <option value="WALLET">Customer wallet</option>
            <option value="ORIGINAL_PAYMENT">Original payment method</option>
          </select>
          <input
            className="h-11 rounded-soft border border-sand-line px-3 text-sm sm:col-span-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
        <button
          disabled={!refundAmount || paymentStatus === "PENDING"}
          onClick={refund}
          className="mt-3 min-h-10 rounded-soft bg-oxblood px-4 text-sm text-parchment disabled:opacity-40"
        >
          Process refund
        </button>
      </section>
    </div>
  );
}
