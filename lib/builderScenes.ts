import type { BuilderType } from "@/lib/builder";

// A "slot" is where a product image is placed on the base photo.
// x/y are the center as a percentage of the container; w is the product
// width as a percentage of the container width; rotate is degrees.
export type Slot = { x: number; y: number; w: number; rotate: number };

export type BuilderScene = {
  base: string; // base photo (swap with your own for best realism)
  aspect: string; // CSS aspect-ratio of the stage
  slots: Slot[]; // fixed positions products drop into
};

// NOTE: base photos live in /public/builder and can be replaced with your
// own studio photos (an empty wrapped bouquet cone / an open gift box) for
// the most realistic result. Slots are hand-tuned to the current photos.
export const BUILDER_SCENES: Record<BuilderType, BuilderScene> = {
  bouquet: {
    base: "/builder/bouquet-base.jpg",
    aspect: "3 / 2",
    slots: [
      { x: 50, y: 30, w: 19, rotate: 0 },
      { x: 37, y: 37, w: 17, rotate: -12 },
      { x: 63, y: 37, w: 17, rotate: 12 },
      { x: 45, y: 47, w: 17, rotate: -6 },
      { x: 57, y: 47, w: 17, rotate: 6 },
      { x: 50, y: 55, w: 16, rotate: 0 },
    ],
  },
  giftbox: {
    base: "/builder/giftbox-base.jpg",
    aspect: "4 / 3",
    slots: [
      { x: 41, y: 46, w: 16, rotate: -6 },
      { x: 56, y: 44, w: 16, rotate: 6 },
      { x: 48, y: 55, w: 16, rotate: 0 },
      { x: 34, y: 57, w: 15, rotate: -9 },
      { x: 62, y: 56, w: 15, rotate: 9 },
      { x: 49, y: 66, w: 15, rotate: 0 },
    ],
  },
};
