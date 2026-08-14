"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const cancel = async () => {
    if (
      !window.confirm(
        "Cancel this order? Cancellation is only available before courier pickup.",
      )
    ) {
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/account/orders/${orderId}/cancel`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "This order could not be cancelled.");
        return;
      }
      setMessage("Your order has been cancelled.");
      router.refresh();
    } catch {
      setMessage("Unable to cancel the order right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Button variant="outline" onClick={cancel} disabled={busy}>
        {busy ? "Cancelling…" : "Cancel order"}
      </Button>
      {message && <p className="mt-2 text-sm text-oxblood">{message}</p>}
    </div>
  );
}
