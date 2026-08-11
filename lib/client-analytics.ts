"use client";

import type { CartItem } from "@/types/commerce";

type PurchaseItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variantLabel?: string | null;
};

type Purchase = {
  orderNumber: string;
  total: number;
  tax: number;
  shipping: number;
  discount: number;
  items: PurchaseItem[];
};

function gaItem(item: PurchaseItem, index: number) {
  return {
    item_id: item.productId,
    item_name: item.name,
    item_variant: item.variantLabel || undefined,
    price: item.price,
    quantity: item.quantity,
    index,
  };
}

function metaContents(items: PurchaseItem[]) {
  return items.map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    item_price: item.price,
  }));
}

export function trackAddToCart(item: Omit<CartItem, "key">) {
  if (typeof window === "undefined") return;
  const value = item.price * item.quantity;
  window.gtag?.("event", "add_to_cart", {
    currency: "INR",
    value,
    items: [gaItem(item, 0)],
  });
  window.fbq?.("track", "AddToCart", {
    content_ids: [item.productId],
    content_name: item.name,
    content_type: "product",
    contents: metaContents([item]),
    currency: "INR",
    value,
  });
}

export function trackBeginCheckout(items: CartItem[], value: number) {
  if (typeof window === "undefined" || !items.length) return;
  window.gtag?.("event", "begin_checkout", {
    currency: "INR",
    value,
    items: items.map(gaItem),
  });
  window.fbq?.("track", "InitiateCheckout", {
    content_ids: items.map((item) => item.productId),
    content_type: "product",
    contents: metaContents(items),
    currency: "INR",
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    value,
  });
}

export function trackPurchase(purchase: Purchase) {
  if (typeof window === "undefined") return false;
  let sent = false;
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: purchase.orderNumber,
      currency: "INR",
      value: purchase.total,
      tax: purchase.tax,
      shipping: purchase.shipping,
      coupon: purchase.discount > 0 ? "applied" : undefined,
      items: purchase.items.map(gaItem),
    });
    sent = true;
  }
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      content_ids: purchase.items.map((item) => item.productId),
      content_type: "product",
      contents: metaContents(purchase.items),
      currency: "INR",
      num_items: purchase.items.reduce((sum, item) => sum + item.quantity, 0),
      value: purchase.total,
    });
    sent = true;
  }
  return sent;
}
