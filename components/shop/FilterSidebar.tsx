"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function FilterSidebar({
  current,
}: {
  current: Record<string, string | undefined>;
}) {
  return (
    <form method="get" className="grid gap-6">
      <div>
        <label className="text-xs uppercase tracking-[0.16em] text-muted-ink">
          Category
        </label>
        <select
          name="category"
          defaultValue={current.category ?? ""}
          className="mt-3 h-11 w-full rounded-soft border border-sand-line bg-parchment px-3 text-sm outline-none focus:border-gold"
        >
          <option value="">All categories</option>
          <option value="personalized-gifts">Personalized Gifts</option>
          <option value="rakhi-festive">Rakhi & Festive</option>
          <option value="home-decor">Home & Decor</option>
          <option value="jewelry-accessories">Jewelry Accessories</option>
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.16em] text-muted-ink">
          Price range
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input
            name="minPrice"
            type="number"
            min="0"
            placeholder="Min ₹"
            defaultValue={current.minPrice}
          />
          <Input
            name="maxPrice"
            type="number"
            min="0"
            placeholder="Max ₹"
            defaultValue={current.maxPrice}
          />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.16em] text-muted-ink">
          Occasion
        </label>
        <select
          name="occasion"
          defaultValue={current.occasion ?? ""}
          className="mt-3 h-11 w-full rounded-soft border border-sand-line bg-parchment px-3 text-sm outline-none focus:border-gold"
        >
          <option value="">Any occasion</option>
          <optgroup label="For">
            <option value="for-her">Gifts for Her</option>
            <option value="for-him">Gifts for Him</option>
            <option value="for-couples">Gifts for Couples</option>
            <option value="for-kids">Gifts for Kids</option>
          </optgroup>
          <optgroup label="Occasion">
            <option value="birthdays">Birthdays</option>
            <option value="weddings">Weddings</option>
            <option value="festivals">Festivals</option>
            <option value="housewarming">Housewarming</option>
            <option value="rakhi">Rakhi</option>
          </optgroup>
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.16em] text-muted-ink">
          Colour
        </label>
        <select
          name="color"
          defaultValue={current.color ?? ""}
          className="mt-3 h-11 w-full rounded-soft border border-sand-line bg-parchment px-3 text-sm outline-none focus:border-gold"
        >
          <option value="">Any colour</option>
          <option value="gold">Gold</option>
          <option value="red">Red</option>
          <option value="natural">Natural</option>
          <option value="terracotta">Terracotta</option>
          <option value="multicolour">Multicolour</option>
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.16em] text-muted-ink">
          Material
        </label>
        <select
          name="material"
          defaultValue={current.material ?? ""}
          className="mt-3 h-11 w-full rounded-soft border border-sand-line bg-parchment px-3 text-sm outline-none focus:border-gold"
        >
          <option value="">Any material</option>
          <option value="brass">Brass</option>
          <option value="wood">Wood</option>
          <option value="cotton">Cotton</option>
          <option value="silk">Silk</option>
          <option value="metal">Metal</option>
          <option value="clay">Clay</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Apply filters</Button>
        <a
          href="/shop"
          className="inline-flex min-h-11 items-center rounded-soft border border-sand-line px-4 text-sm hover:border-gold hover:text-gold"
        >
          Clear
        </a>
      </div>
    </form>
  );
}
