export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock?: number;
  variantId?: string;
  variantLabel?: string;
  customization?: string;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  stock?: number;
  category?: string;
};
