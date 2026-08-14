"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2, Gift, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import type { CatalogProduct } from "@/components/home/ProductCard";
import { guessEmoji, type BuilderType } from "@/lib/builder";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function ItemVisual({
  item,
  className,
  sizes,
}: {
  item: CatalogProduct;
  className?: string;
  sizes: string;
}) {
  const img = item.images?.[0];
  if (img) {
    return (
      <Image
        src={img}
        alt={item.name}
        fill
        sizes={sizes}
        className={`object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <span className="flex h-full w-full items-center justify-center text-3xl sm:text-4xl">
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
    const label = mode === "bouquet" ? "💐 Custom Bouquet" : "🎁 Custom Gift Box";
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
            Add the pieces you love — the price updates as you go. Remove
            anything and the total drops instantly.
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

      <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
        {/* ─────────── 3D STAGE ─────────── */}
        <div
          className="relative flex min-h-[320px] items-center justify-center overflow-hidden p-5 sm:min-h-[360px] sm:p-8"
          style={{ perspective: "1100px" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-gold/15 via-transparent to-transparent" />
          <div
            className="pointer-events-none absolute bottom-10 h-16 w-64 rounded-[100%] bg-ink/10 blur-2xl"
            aria-hidden
          />

          {isBouquet ? (
            /* ── BOUQUET ── */
            <div className="relative flex flex-col items-center">
              <div className="relative flex h-52 items-end justify-center">
                <AnimatePresence>
                  {selected.map((item, idx) => {
                    const n = selected.length;
                    const spread = Math.min(78, n * 20);
                    const angle =
                      n > 1 ? -spread / 2 + (spread / (n - 1)) * idx : 0;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 60, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 60, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="absolute bottom-0"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          transformOrigin: "bottom center",
                        }}
                      >
                        <div
                          className="relative -translate-y-6"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-white to-cream shadow-lift">
                            <ItemVisual item={item} sizes="80px" />
                          </div>
                          {picks[item.id] > 1 && (
                            <span className="absolute -right-1 -top-1 rounded-full bg-oxblood px-1.5 py-0.5 text-[10px] font-semibold text-parchment shadow">
                              ×{picks[item.id]}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {!selected.length && (
                  <div className="absolute bottom-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-sand-line text-3xl text-muted-ink">
                    🌸
                  </div>
                )}
              </div>
              {/* wrap */}
              <div className="relative -mt-2 h-28 w-40">
                <div
                  className="absolute inset-x-0 top-0 mx-auto h-28 w-40 bg-gradient-to-b from-oxblood via-oxblood/90 to-[#5c1a22] shadow-lift-lg"
                  style={{
                    clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)",
                  }}
                />
                <div
                  className="absolute inset-x-0 top-0 mx-auto h-28 w-40 opacity-30"
                  style={{
                    clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)",
                    background:
                      "repeating-linear-gradient(115deg, transparent 0 10px, rgba(255,255,255,.25) 10px 12px)",
                  }}
                />
                <span className="absolute left-1/2 top-2 -translate-x-1/2 text-lg">
                  🎀
                </span>
              </div>
            </div>
          ) : (
            /* ── GIFT BOX ── */
            <div className="relative" style={{ perspective: "900px" }}>
              <motion.div
                className="relative z-20 mx-auto h-7 w-64 rounded-t-lg bg-gradient-to-r from-gold via-gold-light to-gold shadow-lift"
                style={{ transformOrigin: "bottom center" }}
                animate={{ rotateX: selected.length ? -42 : -12 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                  🎀
                </span>
              </motion.div>
              <div className="relative z-10 mx-auto min-h-[168px] w-64 rounded-b-soft-xl border-x-4 border-b-4 border-gold/70 bg-gradient-to-b from-cream to-parchment p-3">
                <div className="grid grid-cols-3 gap-2">
                  <AnimatePresence>
                    {selected.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.4, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.4, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="relative"
                      >
                        <div className="relative h-16 w-full overflow-hidden rounded-soft border border-white bg-white shadow-soft">
                          <ItemVisual item={item} sizes="64px" />
                        </div>
                        {picks[item.id] > 1 && (
                          <span className="absolute -right-1 -top-1 rounded-full bg-oxblood px-1.5 py-0.5 text-[10px] font-semibold text-parchment shadow">
                            ×{picks[item.id]}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {!selected.length && (
                  <p className="flex h-[140px] items-center justify-center text-center text-sm text-muted-ink">
                    Add items to fill your gift box 🎁
                  </p>
                )}
              </div>
            </div>
          )}

          {/* live total badge */}
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
            <span className="text-xs text-muted-ink">{count} added</span>
          </div>

          <div className="mt-4 max-h-[320px] space-y-2.5 overflow-y-auto pr-1">
            {items.map((item) => {
              const q = picks[item.id] ?? 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-soft-xl border border-sand-line bg-parchment p-2.5"
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-soft bg-cream text-2xl">
                    <ItemVisual item={item} sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-ink">{inr(Number(item.price))}</p>
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
