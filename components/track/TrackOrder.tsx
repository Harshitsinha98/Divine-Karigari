"use client";

import { useState } from "react";
import {
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const STAGES = [
  { key: "PENDING", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

type TrackResult = {
  orderNumber: string;
  status: string;
  awb: string | null;
  courier: string | null;
  estimatedDeliveryDate: string | null;
  deliveredAt: string | null;
  items: { productName: string; quantity: number }[];
  events: {
    status: string;
    title: string;
    description: string | null;
    location: string | null;
    happenedAt: string;
  }[];
  live: {
    currentStatus: string | null;
    activities: {
      date: string | null;
      activity: string | null;
      location: string | null;
      status: string | null;
    }[];
  } | null;
};

export function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, identifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to track order.");
        return;
      }
      setResult(data.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex =
    result?.status === "PROCESSING"
      ? 1
      : Math.max(0, STAGES.findIndex((s) => s.key === result?.status));

  return (
    <div className="mx-auto max-w-2xl">
      {/* Search form */}
      <form
        onSubmit={track}
        className="rounded-soft-xl border border-sand-line bg-warm-white p-6 shadow-soft"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            required
            placeholder="Order number (e.g. DK-10023)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <Input
            required
            placeholder="Email or AWB number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-4 w-full">
          <Search size={16} />
          {loading ? "Tracking..." : "Track order"}
        </Button>
        {error && <p className="mt-3 text-sm text-oxblood">{error}</p>}
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 space-y-6">
          {/* Status header */}
          <div className="rounded-soft-xl border border-sand-line bg-warm-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gold">
                  {result.orderNumber}
                </p>
                <h2 className="mt-1 font-display text-2xl capitalize">
                  {result.status.replaceAll("_", " ").toLowerCase()}
                </h2>
              </div>
              {result.awb && (
                <div className="text-right text-sm">
                  <p className="text-muted-ink">AWB</p>
                  <p className="font-medium text-ink">{result.awb}</p>
                  {result.courier && (
                    <p className="text-xs text-muted-ink">{result.courier}</p>
                  )}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-8 flex items-center justify-between">
              {STAGES.map((stage, i) => {
                const active = i <= currentIndex;
                return (
                  <div
                    key={stage.key}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div className="relative flex w-full items-center justify-center">
                      {i > 0 && (
                        <div
                          className={`absolute left-0 right-1/2 top-1/2 h-0.5 -translate-y-1/2 ${i <= currentIndex ? "bg-gold" : "bg-sand-line"}`}
                        />
                      )}
                      {i < STAGES.length - 1 && (
                        <div
                          className={`absolute left-1/2 right-0 top-1/2 h-0.5 -translate-y-1/2 ${i < currentIndex ? "bg-gold" : "bg-sand-line"}`}
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs ${active ? "border-gold bg-gold text-parchment" : "border-sand-line bg-parchment text-muted-ink"}`}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <p
                      className={`mt-2 text-center text-[10px] ${active ? "font-medium text-ink" : "text-muted-ink"}`}
                    >
                      {stage.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {result.estimatedDeliveryDate && result.status !== "DELIVERED" && (
              <p className="mt-6 flex items-center gap-2 border-t border-sand-line pt-4 text-sm text-muted-ink">
                <Clock size={15} className="text-gold" />
                Estimated delivery by{" "}
                <span className="font-medium text-ink">
                  {new Date(result.estimatedDeliveryDate).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </span>
              </p>
            )}
            {result.deliveredAt && (
              <p className="mt-6 flex items-center gap-2 border-t border-sand-line pt-4 text-sm text-tulsi">
                <CheckCircle2 size={15} />
                Delivered on{" "}
                {new Date(result.deliveredAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Live tracking activities (from Shiprocket) */}
          {result.live && result.live.activities.length > 0 && (
            <div className="rounded-soft-xl border border-sand-line bg-warm-white p-6 shadow-soft">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold">
                <Truck size={14} /> Live courier updates
              </p>
              <div className="mt-4 grid gap-4">
                {result.live.activities.map((a, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                    <div>
                      <p className="font-medium">{a.activity}</p>
                      <p className="mt-1 text-xs text-muted-ink">
                        {a.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} /> {a.location} ·{" "}
                          </span>
                        ) : null}
                        {a.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local tracking events fallback */}
          {(!result.live || result.live.activities.length === 0) &&
            result.events.length > 0 && (
              <div className="rounded-soft-xl border border-sand-line bg-warm-white p-6 shadow-soft">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold">
                  <Package size={14} /> Order updates
                </p>
                <div className="mt-4 grid gap-4">
                  {result.events.map((e, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                      <div>
                        <p className="font-medium">{e.title}</p>
                        {e.description && (
                          <p className="mt-1 text-muted-ink">{e.description}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-ink">
                          {e.location ? `${e.location} · ` : ""}
                          {new Date(e.happenedAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
