"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import { WishlistToggle } from "@/components/commerce/WishlistToggle";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price: number | string;
  compareAtPrice?: number | string | null;
  images: string[];
  stock?: number;
  occasionTags?: string[];
  colors?: string[];
  materials?: string[];
  salesCount?: number;
  category: { name: string; slug: string };
  customizationEnabled?: boolean;
};

export function ProductCard({ product }: { product: CatalogProduct }) {
  const [quickView, setQuickView] = useState(false);
  const { addToCart } = useCommerce();
  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;
  return (
    <article className="group min-w-[250px] flex-1 sm:min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-soft-xl bg-sand-line/40">
        <Link
          href={`/shop/${product.slug}`}
          aria-label={`View ${product.name}`}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <WishlistToggle
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.images[0],
              price,
              stock: product.stock,
              category: product.category.name,
            }}
          />
          <button
            onClick={() => setQuickView(true)}
            aria-label={`Quick view ${product.name}`}
            className="rounded-full bg-parchment/90 p-2.5 text-ink shadow-soft transition hover:bg-parchment hover:text-oxblood"
          >
            <Eye size={17} strokeWidth={1.7} />
          </button>
        </div>
        {product.customizationEnabled && (
          <Badge className="absolute bottom-3 left-3 border-parchment/80 bg-parchment/90 text-oxblood">
            Personalizable
          </Badge>
        )}
      </div>
      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-ink">
            {product.category.name}
          </p>
          <Link
            href={`/shop/${product.slug}`}
            className="mt-1 block font-display text-xl leading-tight hover:text-oxblood"
          >
            {product.name}
          </Link>
          <p className="mt-2 text-sm text-muted-ink">
            ₹{price.toLocaleString("en-IN")}{" "}
            {compareAtPrice && (
              <del className="ml-2 text-xs text-muted-ink/60">
                ₹{compareAtPrice.toLocaleString("en-IN")}
              </del>
            )}
          </p>
        </div>
        <Link
          href={`/shop/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="mt-1 rounded-full border border-sand-line p-2 text-gold opacity-0 transition group-hover:opacity-100"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <Modal
        open={quickView}
        onClose={() => setQuickView(false)}
        title={product.name}
      >
        <div className="grid gap-5 sm:grid-cols-[.8fr_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-soft">
            <Image
              src={product.images[0]}
              alt={`${product.name} product preview`}
              fill
              sizes="300px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-ink">
              {product.category.name}
            </p>
            <p className="mt-3 font-display text-3xl">
              ₹{price.toLocaleString("en-IN")}
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-ink">
              {product.shortDescription ?? "A considered piece, made by hand."}
            </p>
            <Button
              className="mt-5"
              onClick={() =>
                addToCart({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: product.images[0],
                  price,
                  quantity: 1,
                  stock: product.stock,
                })
              }
            >
              Add to cart
            </Button>
            <Link
              href={`/shop/${product.slug}`}
              onClick={() => setQuickView(false)}
              className="mt-6 inline-block"
            >
              <Button>View full details</Button>
            </Link>
          </div>
        </div>
      </Modal>
    </article>
  );
}
