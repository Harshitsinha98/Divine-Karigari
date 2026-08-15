"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { CatalogProduct } from "@/components/home/ProductCard";
import { guessEmoji, type BuilderType } from "@/lib/builder";
import { BUILDER_SCENES } from "@/lib/builderScenes";

// Realistic photo composite: real base photo + selected product cut-out
// images dropped into fixed slots, so the whole selection reads as a single
// bouquet / gift box rather than separate products.
export function GiftComposite({
  mode,
  selected,
  picks,
}: {
  mode: BuilderType;
  selected: CatalogProduct[];
  picks: Record<string, number>;
}) {
  const scene = BUILDER_SCENES[mode];
  const shown = selected.slice(0, scene.slots.length);
  const extra = selected.length - shown.length;

  return (
    <div
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-soft-2xl border border-sand-line shadow-lift"
      style={{ aspectRatio: scene.aspect }}
    >
      <Image
        src={scene.base}
        alt={mode === "bouquet" ? "Bouquet" : "Gift box"}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 440px"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

      <AnimatePresence>
        {shown.map((item, i) => {
          const slot = scene.slots[i];
          const img = item.images?.[0];
          const qty = picks[item.id] ?? 1;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 12 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute"
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.w}%`,
                transform: `translate(-50%, -50%) rotate(${slot.rotate}deg)`,
              }}
            >
              <div className="relative aspect-square w-full drop-shadow-[0_8px_12px_rgba(0,0,0,0.45)]">
                {img ? (
                  // Plain img so any product PNG host works without config.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={item.name}
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-white/70 bg-white/95 text-2xl">
                    {guessEmoji(item.name)}
                  </div>
                )}
                {qty > 1 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-oxblood px-1.5 py-0.5 text-[10px] font-semibold text-parchment shadow">
                    ×{qty}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!selected.length && (
        <div className="absolute inset-x-0 bottom-3 text-center text-xs font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
          Add items to build your {mode === "bouquet" ? "bouquet" : "gift box"}
        </div>
      )}
      {extra > 0 && (
        <span className="absolute bottom-2 right-2 rounded-full bg-ink/75 px-2 py-1 text-[10px] font-medium text-parchment">
          +{extra} more inside
        </span>
      )}
    </div>
  );
}
