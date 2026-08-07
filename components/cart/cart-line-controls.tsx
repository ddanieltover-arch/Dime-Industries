// components/cart/cart-line-controls.tsx
"use client";

import { useActionState, useEffect } from "react";
import { updateCartItem, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import { CartRemoveButton } from "@/components/cart/cart-remove-button";
import { useCart } from "@/components/cart/cart-provider";

const initial: CommerceActionState = {};

export function CartLineControls({
  variantId,
  quantity,
  maxQuantity,
}: {
  variantId: string;
  quantity: number;
  maxQuantity: number;
}) {
  const [updateState, updateAction, updatePending] = useActionState(updateCartItem, initial);
  const { setItemCount, setCart } = useCart();

  useEffect(() => {
    if (!updateState.ok) return;
    if (updateState.cart) {
      setCart(updateState.cart);
      return;
    }
    if (typeof updateState.itemCount === "number") {
      setItemCount(updateState.itemCount);
    }
  }, [updateState.ok, updateState.itemCount, updateState.cart, setItemCount, setCart]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={updateAction} className="flex items-center gap-2">
        <input type="hidden" name="variantId" value={variantId} />
        <label className="sr-only" htmlFor={`qty-${variantId}`}>
          Quantity
        </label>
        <input
          id={`qty-${variantId}`}
          type="number"
          name="quantity"
          min={1}
          max={maxQuantity}
          defaultValue={quantity}
          className="field-input w-16 px-2 py-1.5"
        />
        <button
          type="submit"
          disabled={updatePending}
          className="nav-link text-[var(--color-resin)] disabled:opacity-60"
        >
          Update
        </button>
      </form>

      <CartRemoveButton variantId={variantId} />

      {updateState.error ? (
        <p role="alert" className="w-full text-[var(--scale-xs)] text-[var(--color-flag)]">
          {updateState.error}
        </p>
      ) : null}
    </div>
  );
}
