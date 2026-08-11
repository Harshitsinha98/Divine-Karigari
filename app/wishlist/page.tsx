"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { EmptyCommerceState } from "@/components/commerce/EmptyCommerceState";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, moveToCart } = useCommerce();
  return (
    <main className="container py-16 sm:py-24">
      <p className="text-xs uppercase tracking-[0.22em] text-oxblood">
        Saved with feeling
      </p>
      <h1 className="mt-4 font-display text-5xl sm:text-7xl">Your wishlist.</h1>
      {!wishlist.length ? (
        <EmptyCommerceState type="wishlist" />
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <article key={item.productId} className="group">
              <div className="relative aspect-square overflow-hidden rounded-soft-xl bg-sand-line/30">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  aria-label={`Remove ${item.name} from wishlist`}
                  className="absolute right-3 top-3 rounded-full bg-parchment/90 p-2.5 hover:text-oxblood"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-ink">
                {item.category}
              </p>
              <Link
                href={`/shop/${item.slug}`}
                className="mt-1 block font-display text-2xl hover:text-oxblood"
              >
                {item.name}
              </Link>
              <p className="mt-2 text-sm">
                ₹{item.price.toLocaleString("en-IN")}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => moveToCart(item)}
              >
                <ShoppingBag size={16} />
                Move to Cart
              </Button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
