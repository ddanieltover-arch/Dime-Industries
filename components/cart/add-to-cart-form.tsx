// components/cart/add-to-cart-form.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addItemToCart, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import type { CatalogVariant } from "@/lib/catalog/types";

const initial: CommerceActionState = {};

type Props = {
  variants: CatalogVariant[];
  defaultVariantId?: string;
};

export function AddToCartForm({ variants, defaultVariantId }: Props) {
  const [state, formAction, pending] = useActionState(addItemToCart, initial);
  const router = useRouter();
  const inStock = variants.filter((v) => v.quantityOnHand > 0);
  const defaultId = defaultVariantId ?? inStock[0]?.id ?? variants[0]?.id;

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  if (inStock.length === 0) {
    return (
      <p className="rounded-[var(--radius-sm)] border border-[var(--color-flag)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-flag)]">
        Out of stock in your jurisdiction.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Format
          <select
            name="variantId"
            defaultValue={defaultId}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
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

        <label className="flex w-24 flex-col gap-1 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Qty
          <input
            type="number"
            name="quantity"
            min={1}
            max={20}
            defaultValue={1}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-3 text-[var(--scale-sm)] font-medium text-[var(--color-surface)] transition-colors hover:bg-[var(--color-resin-hover)] disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Adding…" : "Add to cart"}
      </button>

      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-[var(--scale-sm)] text-[var(--color-terp)]">
          Added to cart.{" "}
          <a href="/cart" className="underline-offset-4 hover:underline">
            View cart
          </a>
        </p>
      ) : null}
    </form>
  );
}
