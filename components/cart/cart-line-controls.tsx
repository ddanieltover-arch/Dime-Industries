// components/cart/cart-line-controls.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  removeCartItem,
  updateCartItem,
  type CommerceActionState,
} from "@/app/(commerce)/cart-actions";

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
  const [removeState, removeAction, removePending] = useActionState(removeCartItem, initial);
  const router = useRouter();

  useEffect(() => {
    if (updateState.ok || removeState.ok) router.refresh();
  }, [updateState.ok, removeState.ok, router]);

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
          className="w-16 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
        <button
          type="submit"
          disabled={updatePending}
          className="text-[var(--scale-sm)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline disabled:opacity-60"
        >
          Update
        </button>
      </form>

      <form action={removeAction}>
        <input type="hidden" name="variantId" value={variantId} />
        <button
          type="submit"
          disabled={removePending}
          className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:text-[var(--color-flag)] hover:underline disabled:opacity-60"
        >
          Remove
        </button>
      </form>

      {updateState.error || removeState.error ? (
        <p role="alert" className="w-full text-[var(--scale-xs)] text-[var(--color-flag)]">
          {updateState.error ?? removeState.error}
        </p>
      ) : null}
    </div>
  );
}
