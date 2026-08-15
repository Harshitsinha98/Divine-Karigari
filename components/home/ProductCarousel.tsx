"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  ProductCard,
  type CatalogProduct,
} from "@/components/home/ProductCard";

export function ProductCarousel({ products }: { products: CatalogProduct[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (direction: number) =>
    ref.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  return (
    <div>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[75vw] snap-start sm:min-w-[calc(50%-10px)] lg:min-w-[calc(25%-15px)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => move(-1)}
          aria-label="Previous products"
          className="rounded-full border border-sand-line p-2.5 text-ink transition hover:border-gold hover:text-gold"
        >
          <ArrowLeft size={17} />
        </button>
        <button
          onClick={() => move(1)}
          aria-label="Next products"
          className="rounded-full border border-sand-line p-2.5 text-ink transition hover:border-gold hover:text-gold"
        >
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}
