import type { BuilderType } from "@/lib/builder";

// A static illustration photo shown for each builder. The customer picks
// products from the side list (which drive the price); the photo is a sample
// of the finished arrangement. Replace these files in /public/builder with
// your own finished bouquet / gift box photos any time.
export type BuilderScene = {
  image: string;
  aspect: string; // CSS aspect-ratio of the stage
};

export const BUILDER_SCENES: Record<BuilderType, BuilderScene> = {
  bouquet: { image: "/builder/bouquet-illustration.jpg", aspect: "3 / 4" },
  giftbox: { image: "/builder/giftbox-illustration.jpg", aspect: "4 / 3" },
};
