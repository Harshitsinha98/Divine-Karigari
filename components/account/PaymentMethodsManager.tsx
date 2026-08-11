"use client";
import { useEffect, useState } from "react";
import { CreditCard, Trash2, Smartphone } from "lucide-react";
import { AccountCard } from "@/components/account/AccountSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
type Method = {
  id: string;
  type: string;
  label: string;
  last4?: string | null;
  isDefault: boolean;
};
export function PaymentMethodsManager() {
  const [items, setItems] = useState<Method[]>([]);
  const [type, setType] = useState<"card" | "upi">("card");
  const [label, setLabel] = useState("");
  const [last4, setLast4] = useState("");
  const load = async () => {
    const response = await fetch("/api/account/payment-methods");
    if (response.ok) setItems((await response.json()).data);
  };
  useEffect(() => {
    void load();
  }, []);
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
      <div className="grid gap-4">
        {items.map((item) => (
          <AccountCard key={item.id}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-sand-line/30 p-3 text-gold">
                  {item.type === "upi" ? (
                    <Smartphone size={18} />
                  ) : (
                    <CreditCard size={18} />
                  )}
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-ink">
                    {item.type === "card" && item.last4
                      ? `•••• ${item.last4}`
                      : "Saved payment method"}
                    {item.isDefault && " · Default"}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await fetch(`/api/account/payment-methods/${item.id}`, {
                    method: "DELETE",
                  });
                  void load();
                }}
                aria-label="Remove payment method"
                className="text-muted-ink hover:text-oxblood"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </AccountCard>
        ))}
        {!items.length && (
          <p className="text-sm text-muted-ink">
            No saved payment methods yet.
          </p>
        )}
      </div>
      <AccountCard>
        <h2 className="font-display text-2xl">Add a placeholder</h2>
        <p className="mt-3 text-sm leading-7 text-muted-ink">
          Razorpay tokenization will connect here in Phase 7. For now, save a
          display-only method.
        </p>
        <form
          className="mt-5 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await fetch("/api/account/payment-methods", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type,
                label,
                last4,
                isDefault: items.length === 0,
              }),
            });
            setLabel("");
            setLast4("");
            void load();
          }}
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "card" | "upi")}
            className="h-12 rounded-soft border border-sand-line bg-parchment px-3 text-sm"
          >
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>
          <Input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. HDFC Visa"
          />
          <Input
            maxLength={4}
            value={last4}
            onChange={(e) => setLast4(e.target.value)}
            placeholder="Last 4 digits (optional)"
          />
          <Button type="submit">Save method</Button>
        </form>
      </AccountCard>
    </div>
  );
}
