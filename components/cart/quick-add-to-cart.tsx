// components/cart/quick-add-to-cart.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addItemToCart, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import { useCart } from "@/components/cart/cart-provider";
import { trackAddToCart } from "@/lib/analytics/track";
import type { CartLine, CartSnapshot } from "@/lib/cart/types";

const initial: CommerceActionState = {};

type Props = {
  variantId: string;
  productName: string;
  productId?: string;
  productSlug?: string;
  priceCents?: number;
};

function mergeOptimisticLine(cart: CartSnapshot, line: CartLine): CartSnapshot {
  const existing = cart.lines.find((l) => l.variantId === line.variantId);
  const lines = existing
    ? cart.lines.map((l) =>
        l.variantId === line.variantId ? { ...l, quantity: l.quantity + line.quantity } : l
      )
    : [...cart.lines, line];
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalCents = lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
  return { lines, itemCount, subtotalCents };
}

export function QuickAddToCart({
  variantId,
  productName,
  productId,
  productSlug,
  priceCents,
}: Props) {
  const { setItemCount, setCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const rollbackRef = useRef<CartSnapshot | null>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: CommerceActionState, formData: FormData) => {
      setJustAdded(true);
      setCart((current) => {
        rollbackRef.current = current;
        return mergeOptimisticLine(current, {
          variantId,
          quantity: 1,
          productSlug: productSlug || productId || variantId,
          productName,
          lineName: productName,
          weightOrFormat: "",
          sku: variantId,
          unitPriceCents: priceCents ?? 0,
          thcPct: 0,
          cbdPct: 0,
          maxQuantity: 20,
        });
      });

      const result = await addItemToCart(prev, formData);
      if (result.error) {
        if (rollbackRef.current) setCart(rollbackRef.current);
        else setItemCount((c) => c - 1);
        setJustAdded(false);
      } else if (result.cart) {
        setCart(result.cart);
        const price = (priceCents ?? 0) / 100;
        trackAddToCart(
          {
            item_id: productId ?? variantId,
            item_name: productName,
            price,
            quantity: 1,
          },
          price || undefined
        );
      } else if (typeof result.itemCount === "number") {
        setItemCount(result.itemCount);
      }
      return result;
    },
    initial
  );

  useEffect(() => {
    if (state.ok && state.cart) {
      setCart(state.cart);
    } else if (state.ok && typeof state.itemCount === "number") {
      setItemCount(state.itemCount);
    }
  }, [state.ok, state.itemCount, state.cart, setItemCount, setCart]);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const showAdded = justAdded || Boolean(state.ok && !state.error);

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value={1} />
      <button
        type="submit"
        disabled={pending && !justAdded}
        className="btn-primary min-h-11 w-full touch-manipulation py-2.5 text-[10px] tracking-[0.12em]"
        aria-label={showAdded ? `${productName} added to cart` : `Add ${productName} to cart`}
      >
        {showAdded ? "Added" : pending ? "Adding…" : "Add to cart"}
      </button>
      {state.error ? (
        <p role="alert" className="mt-2 text-[var(--scale-xs)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {showAdded && !state.error ? (
        <p role="status" className="status-pulse mt-2 text-[var(--scale-xs)] text-[var(--color-resin)]">
          Added to cart.
        </p>
      ) : null}
    </form>
  );
}
