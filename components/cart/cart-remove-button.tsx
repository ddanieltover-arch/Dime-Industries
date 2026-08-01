// components/cart/cart-remove-button.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  removeCartItem,
  type CommerceActionState,
} from "@/app/(commerce)/cart-actions";
import { useCart } from "@/components/cart/cart-provider";

const initial: CommerceActionState = {};

export function CartRemoveButton({ variantId }: { variantId: string }) {
  const [removeState, removeAction, removePending] = useActionState(removeCartItem, initial);
  const router = useRouter();
  const { setItemCount, refreshCart } = useCart();

  useEffect(() => {
    if (removeState.ok && typeof removeState.itemCount === "number") {
      setItemCount(removeState.itemCount);
      void refreshCart();
      router.refresh();
    }
  }, [removeState.ok, removeState.itemCount, setItemCount, refreshCart, router]);

  return (
    <form action={removeAction}>
      <input type="hidden" name="variantId" value={variantId} />
      <button
        type="submit"
        disabled={removePending}
        aria-label="Remove from cart"
        className="nav-link text-[var(--color-ink-muted)] hover:text-[var(--color-flag)] disabled:opacity-60"
      >
        {removePending ? "Removing…" : "Remove"}
      </button>
      {removeState.error ? (
        <p role="alert" className="mt-1 text-[var(--scale-xs)] text-[var(--color-flag)]">
          {removeState.error}
        </p>
      ) : null}
    </form>
  );
}
