"use client";
import { Heart } from "lucide-react";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import type { WishlistItem } from "@/types/commerce";
export function WishlistToggle({ item }: { item: WishlistItem }) {
  const { toggleWishlist, isWishlisted } = useCommerce();
  const active = isWishlisted(item.productId);
  return (
    <button
      onClick={() => toggleWishlist(item)}
      aria-label={`${active ? "Remove" : "Add"} ${item.name} ${active ? "from" : "to"} wishlist`}
      className="rounded-full bg-parchment/90 p-2.5 text-ink shadow-soft transition hover:bg-parchment hover:text-oxblood"
    >
      <Heart
        size={17}
        strokeWidth={1.7}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
