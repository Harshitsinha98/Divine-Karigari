"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
export function RequestReturnButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    const response = await fetch(`/api/account/orders/${orderId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const result = await response.json();
    setLoading(false);
    setMessage(
      response.ok
        ? "Your return request is with our care team for approval."
        : (result.error ?? "Unable to request a return."),
    );
  };
  return (
    <div>
      {open ? (
        <div className="rounded-soft border border-sand-line p-4">
          <label className="text-sm font-medium">
            Tell us what needs attention
          </label>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for return"
            className="mt-2 min-h-24"
          />
          {message && <p className="mt-2 text-sm text-muted-ink">{message}</p>}
          <div className="mt-3 flex gap-2">
            <Button
              disabled={loading || reason.trim().length < 3}
              onClick={submit}
            >
              {loading ? "Submitting…" : "Submit request"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)}>
          <RotateCcw size={16} />
          Request return
        </Button>
      )}
    </div>
  );
}
