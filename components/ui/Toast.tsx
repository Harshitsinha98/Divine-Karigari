"use client";
import { X } from "lucide-react";
export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
}) {
  return (
    <div
      role="status"
      className="flex items-center gap-4 rounded-soft border border-tulsi/20 bg-tulsi px-4 py-3 text-sm text-parchment shadow-lift"
    >
      <span>{message}</span>
      {onClose && (
        <button aria-label="Dismiss notification" onClick={onClose}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
