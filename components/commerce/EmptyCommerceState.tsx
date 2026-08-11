import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function EmptyCommerceState({ type }: { type: "cart" | "wishlist" }) {
  const wishlist = type === "wishlist";
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-sand-line text-gold">
        <svg
          viewBox="0 0 100 100"
          className="h-20 w-20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          {wishlist ? (
            <path d="M50 78S17 58 17 35c0-10 7-17 16-17 8 0 14 5 17 11 3-6 9-11 17-11 9 0 16 7 16 17 0 23-33 43-33 43Z" />
          ) : (
            <>
              <path d="M18 34h64l-6 42H24l-6-42Z" />
              <path d="M32 38c0-13 6-21 18-21s18 8 18 21" />
              <path d="M36 52h28M36 62h28" />
            </>
          )}
        </svg>
      </div>
      <h1 className="mt-7 font-display text-3xl">
        {wishlist ? "Nothing saved yet." : "Your bag is waiting."}
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted-ink">
        {wishlist
          ? "When a piece speaks to you, save it here for later."
          : "There’s something lovely out there with your name on it."}
      </p>
      <Link href="/shop" className="mt-7 inline-block">
        <Button>Continue shopping</Button>
      </Link>
    </div>
  );
}
