// components/cart/cart-line-controls.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateCartItem, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import { CartRemoveButton } from "@/components/cart/cart-remove-button";
import { useCart } from "@/components/cart/cart-provider";

const initial: CommerceActionState = {};
const QUANTITY_DEBOUNCE_MS = 350;

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
  const formRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedRef = useRef(quantity);

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function scheduleUpdate(nextRaw: string) {
    const next = Number(nextRaw);
    if (!Number.isFinite(next) || next < 1) return;
    const clamped = Math.min(maxQuantity, Math.max(1, Math.floor(next)));
    if (clamped === lastSubmittedRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastSubmittedRef.current = clamped;
      formRef.current?.requestSubmit();
    }, QUANTITY_DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form ref={formRef} action={updateAction} className="flex items-center gap-2">
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
          disabled={updatePending}
          aria-busy={updatePending}
          onChange={(e) => scheduleUpdate(e.target.value)}
          className="field-input w-16 px-2 py-1.5 disabled:opacity-60"
        />
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
