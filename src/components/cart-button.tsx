"use client";

import { useCart } from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CartButton() {
  const { totalItems } = useCart();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.push("/cart")}
      className="relative"
    >
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
          {totalItems}
        </span>
      )}
    </Button>
  );
}
