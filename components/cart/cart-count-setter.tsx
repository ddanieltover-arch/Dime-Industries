// components/cart/cart-count-setter.tsx
"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/cart-provider";

/** Seeds badge count once — never overwrites later optimistic client updates. */
export function CartCountSetter({ count }: { count: number }) {
  const { setItemCount } = useCart();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (count > 0) setItemCount(count);
  }, [count, setItemCount]);

  return null;
}
