// components/cart/quick-add-to-cart.tsx
"use client";

import { useActionState, useEffect } from "react";
import { addItemToCart, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import { useCart } from "@/components/cart/cart-provider";

const initial: CommerceActionState = {};

type Props = {
  variantId: string;
  productName: string;
};

export function QuickAddToCart({ variantId, productName }: Props) {
  const [state, formAction, pending] = useActionState(addItemToCart, initial);
  const { setItemCount } = useCart();

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
        <p role="status" className="mt-2 text-[var(--scale-xs)] text-[var(--color-resin)]">
          Added to cart.
        </p>
      ) : null}
    </form>
  );
}
