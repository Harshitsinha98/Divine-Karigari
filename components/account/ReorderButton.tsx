"use client";
import { ShoppingBag } from "lucide-react";
import { useCommerce } from "@/components/commerce/CommerceProvider";
import { Button } from "@/components/ui/Button";
export function ReorderButton({
  items,
}: {
  items: {
    productId: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    stock: number;
  }[];
}) {
  const { addToCart } = useCommerce();
  return (
    <Button
      variant="outline"
      onClick={() => items.forEach((item) => addToCart(item))}
    >
      <ShoppingBag size={16} /> Reorder items
    </Button>
  );
}
