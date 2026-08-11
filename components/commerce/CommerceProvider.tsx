"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { trackAddToCart } from "@/lib/client-analytics";
import type { CartItem, WishlistItem } from "@/types/commerce";

const CART_KEY = "divine-karigari-cart";
const WISHLIST_KEY = "divine-karigari-wishlist";
type Toast = { id: number; message: string } | null;
type CommerceContext = {
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toast: Toast;
  cartCount: number;
  subtotal: number;
  addToCart: (item: Omit<CartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  moveToCart: (item: WishlistItem) => void;
  syncGuestData: (userId: string) => Promise<void>;
};

const CommerceContext = createContext<CommerceContext | null>(null);

export function CommerceProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [hydrated, setHydrated] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const syncedUser = useRef<string | null>(null);
  const sessionChecked = useRef(false);
  useEffect(() => {
    try {
      setCart(JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]"));
      setWishlist(
        JSON.parse(window.localStorage.getItem(WISHLIST_KEY) ?? "[]"),
      );
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);
  const notify = (message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(
      () => setToast((current) => (current?.id === id ? null : current)),
      2600,
    );
  };
  const addToCart = (item: Omit<CartItem, "key">) => {
    const key = `${item.productId}:${item.variantId ?? "default"}:${item.customization ?? ""}`;
    setCart((current) => {
      const existing = current.find((entry) => entry.key === key);
      return existing
        ? current.map((entry) =>
            entry.key === key
              ? {
                  ...entry,
                  quantity: Math.min(
                    entry.stock || 99,
                    entry.quantity + item.quantity,
                  ),
                }
              : entry,
          )
        : [...current, { ...item, key }];
    });
    trackAddToCart(item);
    notify(`${item.name} added to your cart.`);
  };
  const updateQuantity = (key: string, quantity: number) =>
    setCart((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Math.max(1, Math.min(item.stock || 99, quantity)),
            }
          : item,
      ),
    );
  const removeFromCart = (key: string) =>
    setCart((current) => current.filter((item) => item.key !== key));
  const clearCart = () => setCart([]);
  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlist.some((entry) => entry.productId === item.productId);
    setWishlist((current) =>
      exists
        ? current.filter((entry) => entry.productId !== item.productId)
        : [...current, item],
    );
    notify(exists ? "Removed from your wishlist." : "Saved to your wishlist.");
  };
  const removeFromWishlist = (productId: string) =>
    setWishlist((current) =>
      current.filter((item) => item.productId !== productId),
    );
  const moveToCart = (item: WishlistItem) => {
    addToCart({ ...item, quantity: 1 });
    removeFromWishlist(item.productId);
  };
  const syncGuestData = useCallback(
    async (currentUserId: string) => {
      if (syncedUser.current === currentUserId) return;
      syncedUser.current = currentUserId;
      try {
        const [cartResponse, wishlistResponse] = await Promise.all([
          fetch("/api/cart/merge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: cart }),
          }),
          fetch("/api/wishlist/merge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: wishlist }),
          }),
        ]);
        if (cartResponse.ok) setCart((await cartResponse.json()).data);
        if (wishlistResponse.ok)
          setWishlist((await wishlistResponse.json()).data);
        if (cartResponse.ok && wishlistResponse.ok) setAuthenticated(true);
      } catch {
        syncedUser.current = null;
      }
    },
    [cart, wishlist],
  );
  useEffect(() => {
    if (userId && syncedUser.current !== userId) {
      void syncGuestData(userId);
    }
  }, [userId, syncGuestData]);
  useEffect(() => {
    if (!hydrated || sessionChecked.current) return;
    sessionChecked.current = true;
    void fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return;
        const payload = await response.json();
        if (payload.data?.id && syncedUser.current !== payload.data.id) {
          await syncGuestData(payload.data.id);
        }
      })
      .catch(() => undefined);
  }, [hydrated, syncGuestData]);
  useEffect(() => {
    if (!hydrated || !authenticated) return;
    const timeout = window.setTimeout(() => {
      void fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            customization: item.customization,
          })),
        }),
      });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [authenticated, cart, hydrated]);
  const value = {
    cart,
    wishlist,
    cartOpen,
    setCartOpen,
    toast,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted: (productId: string) =>
      wishlist.some((item) => item.productId === productId),
    removeFromWishlist,
    moveToCart,
    syncGuestData,
  };
  return (
    <CommerceContext.Provider value={value}>
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context)
    throw new Error("useCommerce must be used inside CommerceProvider");
  return context;
}
