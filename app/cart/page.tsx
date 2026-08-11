"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyCommerceState } from "@/components/commerce/EmptyCommerceState";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CartPage() {
  const { cart, subtotal, updateQuantity, removeFromCart } = useCommerce();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  return (
    <main className="container py-16 sm:py-24">
      <p className="text-xs uppercase tracking-[0.22em] text-oxblood">
        Your bag
      </p>
      <h1 className="mt-4 font-display text-5xl sm:text-7xl">
        A little joy, gathered.
      </h1>
      {!cart.length ? (
        <EmptyCommerceState type="cart" />
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-20">
          <section>
            {cart.map((item) => (
              <div
                key={item.key}
                className="flex gap-4 border-b border-sand-line py-6 first:border-t"
              >
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-soft bg-sand-line/30 sm:h-40 sm:w-32">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/shop/${item.slug}`}
                        className="font-display text-xl hover:text-oxblood"
                      >
                        {item.name}
                      </Link>
                      {item.variantLabel && (
                        <p className="mt-1 text-sm text-muted-ink">
                          {item.variantLabel}
                        </p>
                      )}
                      {item.customization && (
                        <p className="mt-1 text-sm text-muted-ink">
                          Engraving: “{item.customization}”
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.key)}
                      aria-label={`Remove ${item.name}`}
                      className="text-muted-ink hover:text-oxblood"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                    <div className="flex h-10 items-center rounded-soft border border-sand-line">
                      <button
                        onClick={() =>
                          updateQuantity(item.key, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="p-2.5 hover:text-gold"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.key, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="p-2.5 hover:text-gold"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>
          <aside className="h-fit rounded-soft-xl border border-sand-line p-6 sm:p-8">
            <h2 className="font-display text-3xl">Summary</h2>
            <div className="mt-7">
              <label className="text-xs uppercase tracking-[0.14em] text-muted-ink">
                Coupon code
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="Enter code"
                />
                <Button
                  variant="outline"
                  onClick={() => setApplied(Boolean(coupon.trim()))}
                >
                  Apply
                </Button>
              </div>
              {applied && (
                <p className="mt-2 text-xs text-tulsi">
                  Coupon noted — discount will be confirmed at checkout.
                </p>
              )}
            </div>
            <div className="mt-7 grid gap-3 border-t border-sand-line pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-ink">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-ink">Estimated shipping</span>
                <span>
                  {subtotal >= 999 ? "Free" : "Calculated at checkout"}
                </span>
              </div>
              <div className="mt-3 flex justify-between border-t border-sand-line pt-4 font-medium">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-ink">
              Free shipping over ₹999 across India. Final delivery estimate
              appears at checkout.
            </p>
            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
