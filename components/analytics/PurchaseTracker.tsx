"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/client-analytics";

type PurchaseTrackerProps = {
  orderNumber: string;
  total: number;
  tax: number;
  shipping: number;
  discount: number;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variantLabel?: string | null;
  }[];
};

export function PurchaseTracker(props: PurchaseTrackerProps) {
  useEffect(() => {
    const storageKey = `divine-karigari-purchase:${props.orderNumber}`;
    if (window.localStorage.getItem(storageKey)) return;

    let attempts = 0;
    const send = () => {
      attempts += 1;
      if (trackPurchase(props)) {
        window.localStorage.setItem(storageKey, new Date().toISOString());
        return;
      }
      if (attempts < 20) window.setTimeout(send, 250);
    };
    send();
  }, [props]);

  return null;
}
