"use client";
import { useState } from "react";
import { Download } from "lucide-react";

export function ReportsPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const href = (type: string) => {
    const params = new URLSearchParams({ type });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/admin/reports?${params.toString()}`;
  };
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-oxblood">
        Data exports
      </p>
      <h1 className="mt-2 font-display text-4xl">Reports</h1>
      <div className="mt-7 rounded-soft-xl border border-sand-line bg-parchment p-5">
        <h2 className="font-display text-2xl">Reporting period</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="text-sm">
            From
            <input
              type="date"
              className="mt-1 block h-11 rounded-soft border border-sand-line px-3"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label className="text-sm">
            To
            <input
              type="date"
              className="mt-1 block h-11 rounded-soft border border-sand-line px-3"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-soft-xl border border-sand-line bg-parchment p-6">
          <h2 className="font-display text-2xl">Sales report</h2>
          <p className="mt-2 text-sm text-muted-ink">
            Paid revenue with subtotal, discounts, shipping, GST and totals.
          </p>
          <a
            href={href("sales")}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-soft bg-ink px-4 text-sm text-parchment"
          >
            <Download size={16} /> Export sales CSV
          </a>
        </section>
        <section className="rounded-soft-xl border border-sand-line bg-parchment p-6">
          <h2 className="font-display text-2xl">Order report</h2>
          <p className="mt-2 text-sm text-muted-ink">
            Order, payment, item count, courier and AWB operational data.
          </p>
          <a
            href={href("orders")}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-soft bg-ink px-4 text-sm text-parchment"
          >
            <Download size={16} /> Export orders CSV
          </a>
        </section>
      </div>
    </div>
  );
}
