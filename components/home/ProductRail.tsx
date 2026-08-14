import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import type { CatalogProduct } from "@/components/home/ProductCard";

const ACCENTS = {
  gold: { pill: "border-gold/20 bg-gold/5 text-gold", dot: "bg-gold" },
  oxblood: {
    pill: "border-oxblood/15 bg-oxblood/5 text-oxblood",
    dot: "bg-oxblood",
  },
  tulsi: { pill: "border-tulsi/15 bg-tulsi/5 text-tulsi", dot: "bg-tulsi" },
} as const;

export function ProductRail({
  eyebrow,
  title,
  description,
  accent = "gold",
  viewAllHref,
  viewAllLabel,
  products,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  accent?: keyof typeof ACCENTS;
  viewAllHref: string;
  viewAllLabel: string;
  products: CatalogProduct[];
}) {
  if (!products.length) return null;
  const a = ACCENTS[accent];
  return (
    <>
      <Reveal>
        <div className="mb-12 flex items-end justify-between gap-5">
          <div>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${a.pill}`}
            >
              <span className={`h-1 w-1 rounded-full ${a.dot}`} />
              {eyebrow}
            </span>
            <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {title}
            </h2>
            {description && (
              <p className="mt-3 max-w-md text-base text-muted-ink">
                {description}
              </p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="group hidden items-center gap-1 rounded-full border border-sand-line px-5 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:border-gold hover:bg-gold/5 hover:text-gold sm:inline-flex"
          >
            {viewAllLabel}
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
        </div>
      </Reveal>
      <Reveal delay={0.15}>
        <ProductCarousel products={products} />
      </Reveal>
    </>
  );
}
