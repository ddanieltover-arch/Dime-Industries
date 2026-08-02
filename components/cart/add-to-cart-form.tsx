// components/cart/add-to-cart-form.tsx
"use client";

import { useActionState, useEffect } from "react";
import { addItemToCart, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import { useCart } from "@/components/cart/cart-provider";
import type { CatalogVariant } from "@/lib/catalog/types";

const initial: CommerceActionState = {};

type Props = {
  variants: CatalogVariant[];
  defaultVariantId?: string;
};

export function AddToCartForm({ variants, defaultVariantId }: Props) {
  const { setItemCount } = useCart();
  const [state, formAction, pending] = useActionState(
    async (prev: CommerceActionState, formData: FormData) => {
      const qty = Math.min(20, Math.max(1, Number(formData.get("quantity") ?? 1) || 1));
      setItemCount((c) => c + qty);
      const result = await addItemToCart(prev, formData);
      if (result.error) {
        setItemCount((c) => c - qty);
      } else if (typeof result.itemCount === "number") {
        setItemCount(result.itemCount);
      }
      return result;
    },
    initial
  );
  const inStock = variants.filter((v) => v.quantityOnHand > 0);
  const defaultId = defaultVariantId ?? inStock[0]?.id ?? variants[0]?.id;

  useEffect(() => {
    if (state.ok && typeof state.itemCount === "number") {
      setItemCount(state.itemCount);
    }
  }, [state.ok, state.itemCount, setItemCount]);

  if (inStock.length === 0) {
    return (
      <p className="border border-[var(--color-flag)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-flag)]">
        Out of stock in your jurisdiction.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Format
          <select
            name="variantId"
            defaultValue={defaultId}
            className="rounded-[var(--radius-pill)] border border-[var(--color-border-interactive)] bg-[var(--color-bg)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-ink)]"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.quantityOnHand <= 0}>
                {v.weightOrFormat}
                {v.quantityOnHand <= 0 ? " (out of stock)" : ""} — $
                {(v.retailPriceCents / 100).toFixed(2)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex w-24 flex-col gap-1.5 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Qty
          <input
            type="number"
            name="quantity"
            min={1}
            max={20}
            defaultValue={1}
            className="rounded-[var(--radius-pill)] border border-[var(--color-border-interactive)] bg-[var(--color-bg)] px-3 py-3 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? "Adding…" : "Add to cart"}
      </button>

      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="status-pulse text-[var(--scale-sm)] text-[var(--color-resin)]">
          Added to cart.
        </p>
      ) : null}
    </form>
  );
}
