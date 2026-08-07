// components/cart/cart-header-controls.tsx
"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { CartIcon, HeartIcon, headerIconBtnClass } from "@/components/shared/header-icons";

const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer),
  { ssr: false },
);

function prefetchCartDrawer() {
  void import("@/components/cart/cart-drawer");
}

export function CartHeaderControls() {
  const { cart, itemCount, refreshCart } = useCart();
  const [open, setOpen] = useState(false);
  const [drawerReady, setDrawerReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const ensureDrawer = useCallback(() => {
    setDrawerReady(true);
    prefetchCartDrawer();
  }, []);

  const openCart = useCallback(() => {
    ensureDrawer();
    setOpen(true);
  }, [ensureDrawer]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void refreshCart().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, refreshCart]);

  return (
    <>
      <button
        type="button"
        onClick={openCart}
        onPointerEnter={ensureDrawer}
        onFocus={ensureDrawer}
        aria-label={`View cart, ${itemCount} items`}
        className={headerIconBtnClass}
      >
        <CartIcon />
        {itemCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-[var(--color-resin)] px-1 font-[var(--font-display)] text-[9px] leading-none text-black">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </button>
      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className={`${headerIconBtnClass} hidden sm:inline-flex`}
      >
        <HeartIcon />
      </Link>
      {drawerReady ? (
        <CartDrawer open={open} onOpenChange={setOpen} cart={cart} loading={loading} />
      ) : null}
    </>
  );
}
