"use client";

import Image from "next/image";
import { BUILDER_DISCLAIMER, type BuilderType } from "@/lib/builder";
import { BUILDER_SCENES } from "@/lib/builderScenes";

// Static sample photo of the finished arrangement + illustration disclaimer.
// The customer's chosen products drive the price and appear in the cart.
export function GiftComposite({
  mode,
  count,
}: {
  mode: BuilderType;
  count: number;
}) {
  const scene = BUILDER_SCENES[mode];
  return (
    <div className="mx-auto w-full max-w-sm">
      <div
        className="relative w-full overflow-hidden rounded-soft-2xl border border-sand-line bg-white shadow-lift"
        style={{ aspectRatio: scene.aspect }}
      >
        <Image
          src={scene.image}
          alt={mode === "bouquet" ? "Sample bouquet" : "Sample gift box"}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-contain"
        />
        {count > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-parchment backdrop-blur">
            {count} item{count > 1 ? "s" : ""} selected
          </span>
        )}
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-muted-ink">
        <span aria-hidden className="mt-px">
          &#9432;
        </span>
        <span>{BUILDER_DISCLAIMER}</span>
      </p>
    </div>
  );
}
