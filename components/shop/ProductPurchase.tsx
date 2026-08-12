"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DeliveryEstimate } from "@/components/shop/DeliveryEstimate";
import { useCommerce } from "@/components/commerce/CommerceProvider";

type Variant = {
  id: string;
  name?: string | null;
  size?: string | null;
  color?: string | null;
  price?: number | null;
  stock: number;
};
type Review = {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  adminReply?: string | null;
  user?: { name: string | null } | null;
};
export type ProductDetailData = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  stock: number;
  customizationEnabled: boolean;
  customizationLabel?: string | null;
  customizationMaxLength?: number | null;
  returnWindowDays?: number | null;
  category: { name: string; slug: string };
  variants: Variant[];
  reviews: Review[];
};

export function ProductPurchase({ product }: { product: ProductDetailData }) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState("");
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } =
    useCommerce();
  const price = selectedVariant?.price ?? product.price;
  const stock = selectedVariant?.stock ?? product.stock;
  const wishlisted = isWishlisted(product.id);
  const addItem = () =>
    addToCart({
      productId: product.id,
      slug: product.slug ?? "",
      name: product.name,
      image: product.images[0],
      price,
      quantity,
      stock,
      variantId: selectedVariant?.id,
      variantLabel:
        (selectedVariant?.name ??
          [selectedVariant?.size, selectedVariant?.color]
            .filter(Boolean)
            .join(" · ")) ||
        undefined,
      customization: customization || undefined,
    });
  const average = product.reviews.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
    : 5;
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-oxblood">
        {product.category.name}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
        {product.name}
      </h1>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 text-gold">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              fill={star <= Math.round(average) ? "currentColor" : "none"}
            />
          ))}
          <span className="ml-2 text-sm text-muted-ink">
            {product.reviews.length
              ? `${product.reviews.length} reviews`
              : "Loved by thoughtful gifters"}
          </span>
        </div>
        <Badge
          className={
            stock < 5
              ? "border-oxblood/30 bg-oxblood/10 text-oxblood"
              : "border-tulsi/30 bg-tulsi/10 text-tulsi"
          }
        >
          {stock > 0
            ? stock < 5
              ? `Only ${stock} left`
              : "In stock"
            : "Sold out"}
        </Badge>
        {product.returnWindowDays !== undefined && product.returnWindowDays !== null && product.returnWindowDays > 0 && (
          <Badge className="border-gold/30 bg-gold/10 text-gold">
            {product.returnWindowDays} days easy return
          </Badge>
        )}
      </div>
      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-3xl">
          ₹{price.toLocaleString("en-IN")}
        </span>
        {product.compareAtPrice && (
          <del className="text-base text-muted-ink/60">
            ₹{product.compareAtPrice.toLocaleString("en-IN")}
          </del>
        )}
      </div>
      <p className="mt-5 text-base leading-8 text-muted-ink">
        {product.description}
      </p>
      {product.variants.length > 0 && (
        <div className="mt-7">
          <p className="text-sm font-medium">Choose your variant</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`rounded-soft border px-4 py-2 text-sm ${selectedVariant?.id === variant.id ? "border-ink bg-ink text-parchment" : "border-sand-line hover:border-gold"}`}
              >
                {variant.name ??
                  [variant.size, variant.color].filter(Boolean).join(" · ")}
              </button>
            ))}
          </div>
        </div>
      )}
      {product.customizationEnabled && (
        <div className="mt-7 rounded-soft-xl border border-gold/35 bg-gold/5 p-5">
          <p className="font-display text-2xl">Personalize this gift</p>
          <label className="mt-4 block text-sm text-muted-ink">
            {product.customizationLabel ?? "Your message"}
            <Input
              value={customization}
              maxLength={product.customizationMaxLength ?? 40}
              onChange={(event) => setCustomization(event.target.value)}
              placeholder="Write something meaningful..."
              className="mt-2 bg-parchment"
            />
          </label>
          <p className="mt-2 text-right text-xs text-muted-ink">
            {customization.length}/{product.customizationMaxLength ?? 40}
          </p>
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <div className="flex h-12 items-center rounded-soft border border-sand-line">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            className="p-3 hover:text-gold"
          >
            <Minus size={16} />
          </button>
          <span className="w-7 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stock || 1, quantity + 1))}
            aria-label="Increase quantity"
            className="p-3 hover:text-gold"
          >
            <Plus size={16} />
          </button>
        </div>
        <Button disabled={!stock} onClick={addItem}>
          <ShoppingBag size={17} />
          Add to Cart
        </Button>
        <Button
          variant="secondary"
          disabled={!stock}
          onClick={() => {
            addItem();
            setCartOpen(true);
          }}
        >
          Buy Now
        </Button>
        <button
          onClick={() =>
            toggleWishlist({
              productId: product.id,
              slug: product.slug ?? "",
              name: product.name,
              image: product.images[0],
              price,
              stock,
              category: product.category.name,
            })
          }
          aria-label="Toggle wishlist"
          className="rounded-soft border border-sand-line p-3 hover:border-oxblood hover:text-oxblood"
        >
          <Heart size={19} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>
      {/* Pincode-based delivery estimate */}
      <DeliveryEstimate productId={product.id} quantity={quantity} />
      <div className="mt-10">
        <Accordion
          items={[
            { title: "Description", content: product.description },
            {
              title: "Shipping & Returns",
              content:
                product.returnWindowDays !== undefined && product.returnWindowDays !== null
                  ? `Free shipping on orders over ₹999. Easy returns within ${product.returnWindowDays} days of delivery. Personalized items are made to order and may have different return policies.`
                  : "Free shipping on orders over ₹999. Easy returns within 7 days of delivery. Personalized items are made to order and are generally not eligible for return unless they arrive damaged or incorrect.",
            },
            {
              title: "Care Instructions",
              content:
                "Keep handcrafted pieces away from prolonged moisture, direct heat, and harsh cleaning products. A soft, dry cloth is usually best.",
            },
          ]}
        />
      </div>
      <Reviews reviews={product.reviews} average={average} />
    </div>
  );
}

function Reviews({ reviews, average }: { reviews: Review[]; average: number }) {
  return (
    <section className="mt-10 border-t border-sand-line pt-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gold">
            Kind words
          </p>
          <h2 className="mt-2 font-display text-3xl">Reviews</h2>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl">{average.toFixed(1)}</p>
          <div className="flex gap-0.5 text-gold">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={13} fill="currentColor" />
            ))}
          </div>
        </div>
      </div>
      {reviews.length ? (
        <div className="mt-6 grid gap-5">
          {reviews.map((review) => (
            <div key={review.id} className="border-t border-sand-line pt-5">
              <div className="flex gap-1 text-gold">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={13}
                    fill={star <= review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              {review.title && (
                <h3 className="mt-2 font-medium">{review.title}</h3>
              )}
              <p className="mt-2 text-sm leading-7 text-muted-ink">
                {review.body}
              </p>
              <p className="mt-2 text-xs text-muted-ink">
                {review.user?.name ?? "Verified customer"}
              </p>
              {review.adminReply && (
                <div className="mt-4 border-l-2 border-gold bg-sand-line/20 px-4 py-3 text-sm">
                  <p className="font-medium">Divine Karigari</p>
                  <p className="mt-1 leading-6 text-muted-ink">
                    {review.adminReply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-ink">
          Reviews from our first thoughtful gifters will appear here.
        </p>
      )}
    </section>
  );
}
