"use client";

import { useState } from "react";
import { MapPin, Truck, Clock, CheckCircle2, XCircle } from "lucide-react";

type EstimateResult = {
  available: boolean;
  estimatedDays: number | null;
  courierName: string | null;
  rate: number | null;
  estimatedDeliveryDate: string | null;
  unconfigured?: boolean;
};

export function DeliveryEstimate({
  productId,
  quantity = 1,
}: {
  productId: string;
  quantity?: number;
}) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = /^\d{6}$/.test(pincode);

  const check = async () => {
    if (!valid) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/shipping/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, pincode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to check delivery.");
        return;
      }
      setResult(data.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="mt-8 rounded-soft-xl border border-sand-line bg-cream/40 p-5">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-gold" />
        <p className="text-sm font-medium text-ink">Check delivery & speed</p>
      </div>

      <div className="mt-3 flex items-stretch overflow-hidden rounded-soft border border-sand-line bg-parchment transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setResult(null);
            setError("");
          }}
          placeholder="Enter 6-digit pincode"
          className="h-11 flex-1 bg-transparent px-4 text-sm text-ink outline-none placeholder:text-muted-ink/60"
          onKeyDown={(e) => e.key === "Enter" && check()}
        />
        <button
          type="button"
          onClick={check}
          disabled={loading || !valid}
          className="shrink-0 bg-ink px-5 text-sm font-medium text-parchment transition hover:bg-tulsi disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-oxblood">{error}</p>}

      {result && (
        <div className="mt-4 space-y-2.5 text-sm">
          {result.available ? (
            <>
              <div className="flex items-center gap-2 text-tulsi">
                <CheckCircle2 size={16} />
                <span className="font-medium">
                  Delivery available to {pincode}
                </span>
              </div>

              {result.estimatedDays && (
                <div className="flex items-center gap-2 text-muted-ink">
                  <Clock size={15} className="text-gold" />
                  <span>
                    Estimated delivery in{" "}
                    <span className="font-medium text-ink">
                      {result.estimatedDays} day
                      {result.estimatedDays > 1 ? "s" : ""}
                    </span>
                    {formatDate(result.estimatedDeliveryDate) && (
                      <>
                        {" "}
                        &middot; by{" "}
                        <span className="font-medium text-ink">
                          {formatDate(result.estimatedDeliveryDate)}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-ink">
                <Truck size={15} className="text-gold" />
                <span className="font-medium text-tulsi">
                  Free shipping on orders above &#8377;499
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-oxblood">
              <XCircle size={16} />
              <span>
                Sorry, delivery is not available to {pincode} right now.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
