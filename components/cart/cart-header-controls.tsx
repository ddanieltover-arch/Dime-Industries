// components/cart/cart-header-controls.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/components/cart/cart-provider";

export function CartHeaderControls() {
  const { cart, itemCount, refreshCart } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      void refreshCart();
    }
  }, [open, refreshCart]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View cart, ${itemCount} items`}
        className="border border-[var(--color-border-interactive)] px-3 py-2 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-[border-color,color] duration-[var(--motion-fast)] hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
      >
        Cart
        {itemCount > 0 ? <span className="ml-1.5 text-[var(--color-resin)]">({itemCount})</span> : null}
      </button>
      <Link
        href="/wishlist"
        className="hidden px-2 py-2 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin)] md:inline"
      >
        Wishlist
      </Link>
      <CartDrawer open={open} onOpenChange={setOpen} cart={cart} />
    </>
  );
}
