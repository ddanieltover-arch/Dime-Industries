// components/cart/quick-add-to-cart.tsx
"use client";

import { useActionState, useEffect } from "react";
import { addItemToCart, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import { useCart } from "@/components/cart/cart-provider";
import { trackAddToCart } from "@/lib/analytics/track";

const initial: CommerceActionState = {};

type Props = {
  variantId: string;
  productName: string;
  productId?: string;
  priceCents?: number;
};

export function QuickAddToCart({
  variantId,
  productName,
  productId,
  priceCents,
}: Props) {
  const { setItemCount } = useCart();
  const [state, formAction, pending] = useActionState(
    async (prev: CommerceActionState, formData: FormData) => {
      setItemCount((c) => c + 1);
      const result = await addItemToCart(prev, formData);
      if (result.error) {
        setItemCount((c) => c - 1);
      } else if (typeof result.itemCount === "number") {
        setItemCount(result.itemCount);
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
      }
      return result;
    },
    initial
  );

  useEffect(() => {
    if (state.ok && typeof state.itemCount === "number") {
      setItemCount(state.itemCount);
    }
  }, [state.ok, state.itemCount, setItemCount]);

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value={1} />
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-2.5 text-[10px] tracking-[0.12em]"
        aria-label={pending ? `Adding ${productName}` : `Add ${productName} to cart`}
      >
        {pending ? "Adding…" : "Add to cart"}
      </button>
      {state.error ? (
        <p role="alert" className="mt-2 text-[var(--scale-xs)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="status-pulse mt-2 text-[var(--scale-xs)] text-[var(--color-resin)]">
          Added to cart.
        </p>
      ) : null}
    </form>
  );
}
