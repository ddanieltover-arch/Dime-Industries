// components/cart/cart-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartSnapshot } from "@/lib/cart/types";

type CartContextValue = {
  cart: CartSnapshot;
  itemCount: number;
  setItemCount: (count: number | ((prev: number) => number)) => void;
  setCart: (cart: CartSnapshot | ((prev: CartSnapshot) => CartSnapshot)) => void;
  refreshCart: () => Promise<CartSnapshot | null>;
};

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CART: CartSnapshot = { lines: [], itemCount: 0, subtotalCents: 0 };

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartSnapshot;
  children: ReactNode;
}) {
  // Intentionally no sync-from-props effect — root layout remounts/refetches
  // must not wipe optimistic client cart state on every navigation.
  const [cart, setCart] = useState<CartSnapshot>(initialCart);

  const setItemCount = useCallback((count: number | ((prev: number) => number)) => {
    setCart((prev) => ({
      ...prev,
      itemCount: Math.max(0, typeof count === "function" ? count(prev.itemCount) : count),
    }));
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return null;
      const next = (await res.json()) as CartSnapshot;
      setCart(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      itemCount: cart.itemCount,
      setItemCount,
      setCart,
      refreshCart,
    }),
    [cart, setItemCount, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      cart: EMPTY_CART,
      itemCount: 0,
      setItemCount: () => undefined,
      setCart: () => undefined,
      refreshCart: async () => null,
    };
  }
  return ctx;
}
