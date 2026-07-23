// components/cart/cart-header-controls.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { CartSnapshot } from "@/lib/cart/types";

export function CartHeaderControls({ cart }: { cart: CartSnapshot }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View cart, ${cart.itemCount} items`}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-raised)]"
      >
        Cart
        {cart.itemCount > 0 ? (
          <span className="ml-1.5 font-[var(--font-mono)] text-[var(--color-resin-strong)]">
            ({cart.itemCount})
          </span>
        ) : null}
      </button>
      <Link
        href="/wishlist"
        className="hidden text-[var(--scale-sm)] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)] sm:block"
      >
        Wishlist
      </Link>
      <CartDrawer open={open} onOpenChange={setOpen} cart={cart} />
    </>
  );
}
