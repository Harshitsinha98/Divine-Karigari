"use client";

import { useMemo, useState } from "react";
import { Flower2, Gift, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import type { CatalogProduct } from "@/components/home/ProductCard";
import { GiftComposite } from "@/components/home/GiftComposite";
import {
  BUILDER_CART_LABEL,
  guessEmoji,
  type BuilderType,
} from "@/lib/builder";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Thumb({ item }: { item: CatalogProduct }) {
  const img = item.images?.[0];
  if (img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        alt={item.name}
        className="h-full w-full rounded-soft object-cover"
      />
    );
  }
  return (
    <span className="flex h-full w-full items-center justify-center text-2xl">
      {guessEmoji(item.name)}
    </span>
  );
}

export function GiftBuilderStudio({
  bouquetItems,
  giftboxItems,
  demo = false,
}: {
  bouquetItems: CatalogProduct[];
  giftboxItems: CatalogProduct[];
  demo?: boolean;
}) {
  const { addToCart, setCartOpen } = useCommerce();
  const [mode, setMode] = useState<BuilderType>("bouquet");
  const [picks, setPicks] = useState<Record<string, number>>({});

  const items = mode === "bouquet" ? bouquetItems : giftboxItems;
  const selected = useMemo(
    () => items.filter((item) => (picks[item.id] ?? 0) > 0),
    [items, picks],
  );
  const total = selected.reduce(
    (sum, item) => sum + Number(item.price) * picks[item.id],
    0,
  );
  const count = selected.reduce((sum, item) => sum + picks[item.id], 0);

  const switchMode = (next: BuilderType) => {
    if (next === mode) return;
    setMode(next);
    setPicks({});
  };
  const add = (id: string) =>
    setPicks((p) => ({ ...p, [id]: Math.min(20, (p[id] ?? 0) + 1) }));
  const dec = (id: string) =>
    setPicks((p) => {
      const q = (p[id] ?? 0) - 1;
      const next = { ...p };
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });

  const addAll = () => {
    if (!count) return;
    const label = BUILDER_CART_LABEL[mode];
    selected.forEach((item) =>
      addToCart({
        productId: item.id,
        slug: item.slug,
        name: item.name,
        image: item.images?.[0] ?? "",
        price: Number(item.price),
        quantity: picks[item.id],
        customization: label,
        stock: item.stock,
      }),
    );
    setPicks({});
    setCartOpen(true);
  };

  const isBouquet = mode === "bouquet";

  return (
    <div className="overflow-hidden rounded-soft-3xl border border-sand-line bg-gradient-to-br from-warm-white via-parchment to-cream shadow-lift-lg">
      {/* Header + mode toggle */}
      <div className="flex flex-col gap-5 border-b border-sand-line/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
            <Sparkles size={12} /> Build your own
          </span>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Craft a{" "}
            <span className="text-gradient-gold">
              {isBouquet ? "custom bouquet" : "custom gift box"}.
            </span>
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-ink">
            Add the pieces you love — they arrange into one{" "}
            {isBouquet ? "bouquet" : "gift box"} and the price updates as you go.
          </p>
        </div>
        <div className="inline-flex shrink-0 rounded-full border border-sand-line bg-parchment p-1">
          <button
            onClick={() => switchMode("bouquet")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              isBouquet ? "bg-ink text-parchment" : "text-muted-ink"
            }`}
          >
            <Flower2 size={15} /> Bouquet
          </button>
          <button
            onClick={() => switchMode("giftbox")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              !isBouquet ? "bg-ink text-parchment" : "text-muted-ink"
            }`}
          >
            <Gift size={15} /> Gift Box
          </button>
        </div>
      </div>

      {demo && (
        <div className="border-b border-gold/20 bg-gold/5 px-6 py-2.5 text-center text-xs text-oxblood sm:px-8">
          Preview items shown. Store owner: open{" "}
          <span className="font-semibold">Admin → Gift Builder</span> and click
          &ldquo;Load starter kit&rdquo; to enable real checkout.
        </div>
      )}

      <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
        {/* ─────────── PHOTO COMPOSITE STAGE ─────────── */}
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-gradient-radial from-gold/10 via-transparent to-transparent p-5 sm:p-8">
          <GiftComposite mode={mode} count={count} />
          <div className="absolute right-4 top-4 rounded-soft-xl border border-sand-line bg-parchment/90 px-3 py-1.5 text-right shadow-soft backdrop-blur sm:right-6 sm:top-6 sm:px-4 sm:py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-ink">
              Total
            </p>
            <p className="font-display text-xl leading-none sm:text-2xl">
              {inr(total)}
            </p>
          </div>
        </div>

        {/* ─────────── PALETTE ─────────── */}
        <div className="border-t border-sand-line/70 bg-parchment/60 p-6 sm:p-7 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">
              Choose your {isBouquet ? "blooms & add-ons" : "gift box items"}
            </h3>
            <span className="text-xs text-muted-ink">{count} selected</span>
          </div>

          <div className="mt-4 max-h-[320px] space-y-2.5 overflow-y-auto pr-1">
            {items.map((item) => {
              const q = picks[item.id] ?? 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-soft-xl border border-sand-line bg-parchment p-2.5"
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-soft bg-cream">
                    <Thumb item={item} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-ink">
                      {inr(Number(item.price))}
                    </p>
                  </div>
                  {q > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dec(item.id)}
                        aria-label={`Remove one ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-line text-ink transition hover:border-oxblood hover:text-oxblood"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">
                        {q}
                      </span>
                      <button
                        onClick={() => add(item.id)}
                        aria-label={`Add one ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-line text-ink transition hover:border-gold hover:text-gold"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => add(item.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-parchment transition hover:bg-ink/90"
                    >
                      <Plus size={13} /> Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-sand-line/70 pt-5">
            <div>
              <p className="text-xs text-muted-ink">
                {count
                  ? `${count} item${count > 1 ? "s" : ""} in your ${
                      isBouquet ? "bouquet" : "gift box"
                    }`
                  : "Your creation is empty"}
              </p>
              <p className="font-display text-2xl">{inr(total)}</p>
            </div>
            <button
              onClick={addAll}
              disabled={!count}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition duration-300 hover:bg-gold-light hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag size={16} />
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
