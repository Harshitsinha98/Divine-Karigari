"use client";

import { useState } from "react";
import { ReturnForm } from "@/components/account/ReturnForm";
import { Button } from "@/components/ui/Button";

export function ReturnFormWrapper({ orderId }: { orderId: string }) {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowForm(true)}
        className="mt-4"
      >
        Request a Return
      </Button>
    );
  }

  return (
    <div className="mt-6">
      <ReturnForm orderId={orderId} />
    </div>
  );
}
