// Shared constants for the customizable Gift Builder (Bouquet + Gift Box).
// Builder items are stored as regular ACTIVE Products inside a dedicated,
// storefront-hidden "Gift Builder" category and tagged (via occasionTags)
// for the bouquet and/or gift-box experiences. This avoids any Prisma
// migration while giving admins full control over items and prices.

export const BUILDER_CATEGORY_SLUG = "gift-builder";
export const BUILDER_CATEGORY_NAME = "Gift Builder";
export const BUILDER_CATEGORY_DESCRIPTION =
  "Items customers can add to custom bouquets and gift boxes.";

export const BUILDER_TAG = {
  bouquet: "builder-bouquet",
  giftbox: "builder-giftbox",
} as const;

export type BuilderType = "bouquet" | "giftbox";

// Cart line label used to group a custom creation as a single item.
export const BUILDER_CART_LABEL: Record<BuilderType, string> = {
  bouquet: "💐 Custom Bouquet",
  giftbox: "🎁 Custom Gift Box",
};

// Fallback / starter items shown until an admin configures their own.
export const STARTER_BUILDER_ITEMS: {
  name: string;
  price: number;
  emoji: string;
  types: BuilderType[];
}[] = [
  { name: "Teddy Bear", price: 349, emoji: "🧸", types: ["bouquet", "giftbox"] },
  {
    name: "Chocolate Box",
    price: 249,
    emoji: "🍫",
    types: ["bouquet", "giftbox"],
  },
  { name: "Premium Pen", price: 199, emoji: "🖊️", types: ["giftbox"] },
  { name: "Hair Clutcher", price: 129, emoji: "🎀", types: ["giftbox"] },
  {
    name: "Silk Scrunchy",
    price: 99,
    emoji: "💗",
    types: ["bouquet", "giftbox"],
  },
];

export function builderSlugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMOJI_MAP: Record<string, string> = {
  teddy: "🧸",
  bear: "🧸",
  chocolate: "🍫",
  choco: "🍫",
  candy: "🍬",
  pen: "🖊️",
  clutcher: "🎀",
  clip: "🎀",
  bow: "🎀",
  scrunchy: "💗",
  scrunchie: "💗",
  flower: "🌸",
  rose: "🌹",
  tulip: "🌷",
  bouquet: "💐",
  candle: "🕯️",
  mug: "☕",
  cup: "☕",
  card: "💌",
  note: "💌",
  perfume: "🌷",
  jewel: "💎",
  ring: "💍",
  necklace: "📿",
  earring: "💎",
  keychain: "🔑",
  frame: "🖼️",
  plant: "🪴",
  cookie: "🍪",
  cake: "🧁",
  soap: "🧼",
};

export function guessEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(EMOJI_MAP)) {
    if (lower.includes(key)) return EMOJI_MAP[key];
  }
  return "🎁";
}
