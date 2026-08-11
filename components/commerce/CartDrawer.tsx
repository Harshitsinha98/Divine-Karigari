"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCommerce();
  return (
    <div
      className={`fixed inset-0 z-50 transition ${cartOpen ? "visible" : "invisible"}`}
    >
      <button
        aria-label="Close cart"
        onClick={() => setCartOpen(false)}
        className={`absolute inset-0 bg-ink/30 transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-parchment shadow-lift transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-sand-line px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">
              Your bag
            </p>
            <h2 className="mt-1 font-display text-2xl">
              A little joy, gathered.
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="rounded-full p-2 hover:bg-sand-line/30"
          >
            <X size={19} />
          </button>
        </div>
        {cart.length ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {cart.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 border-b border-sand-line py-4 first:pt-0"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-soft bg-sand-line/30">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="font-display text-lg leading-tight hover:text-oxblood"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="text-muted-ink hover:text-oxblood"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {item.variantLabel && (
                      <p className="mt-1 text-xs text-muted-ink">
                        {item.variantLabel}
                      </p>
                    )}
                    {item.customization && (
                      <p className="mt-1 text-xs text-muted-ink">
                        “{item.customization}”
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-soft border border-sand-line">
                        <button
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="p-1.5 hover:text-gold"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="p-1.5 hover:text-gold"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <p className="text-sm">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-sand-line px-5 py-5">
              <label className="text-xs uppercase tracking-[0.14em] text-muted-ink">
                Have a coupon?
              </label>
              <Input placeholder="Enter code" className="mt-2" />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-ink">Subtotal</span>
                <span className="font-medium">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-ink">
                Shipping calculated at checkout · Free over ₹999
              </p>
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className="mt-4 block"
              >
                <Button className="w-full">Proceed to Checkout</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyCart />
          </div>
        )}
      </aside>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-sand-line text-gold">
        <svg
          viewBox="0 0 90 90"
          className="h-16 w-16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M17 32h56l-5 37H22l-5-37Z" />
          <path d="M30 36c0-12 5-19 15-19s15 7 15 19" />
          <path d="M35 49h20M35 58h20" />
        </svg>
      </div>
      <h3 className="mt-6 font-display text-2xl">Your bag is waiting.</h3>
      <p className="mt-2 text-sm leading-7 text-muted-ink">
        There’s something lovely out there with your name on it.
      </p>
      <Link href="/shop" className="mt-6 inline-block">
        <Button onClick={() => {}}>Continue shopping</Button>
      </Link>
    </div>
  );
}
