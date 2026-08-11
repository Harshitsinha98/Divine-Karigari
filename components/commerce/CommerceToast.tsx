"use client";
import { Check } from "lucide-react";
import { useCommerce } from "@/components/commerce/CommerceProvider";
export function CommerceToast() {
  const { toast, setCartOpen } = useCommerce();
  return toast ? (
    <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-soft border border-tulsi/20 bg-tulsi px-4 py-3 text-sm text-parchment shadow-lift">
      <span className="rounded-full bg-parchment/15 p-1">
        <Check size={14} />
      </span>
      <span>{toast.message}</span>
      <button
        onClick={() => setCartOpen(true)}
        className="ml-2 text-xs underline underline-offset-4"
      >
        View bag
      </button>
    </div>
  ) : null;
}
