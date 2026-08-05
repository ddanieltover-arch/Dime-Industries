// components/cart/add-to-cart-form.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { addItemToCart, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import { useCart } from "@/components/cart/cart-provider";
import { trackAddToCart } from "@/lib/analytics/track";
import type { CatalogVariant } from "@/lib/catalog/types";

const initial: CommerceActionState = {};

type Props = {
  variants: CatalogVariant[];
  defaultVariantId?: string;
  productId?: string;
  productName?: string;
  /** Stable id so the mobile sticky buy bar can submit this form */
  formId?: string;
};

export function AddToCartForm({
  variants,
  defaultVariantId,
  productId,
  productName,
  formId = "pdp-add-to-cart",
}: Props) {
  const { setItemCount } = useCart();
  const lastTracked = useRef(0);
  const [state, formAction, pending] = useActionState(
    async (prev: CommerceActionState, formData: FormData) => {
      const qty = Math.min(20, Math.max(1, Number(formData.get("quantity") ?? 1) || 1));
      const variantId = String(formData.get("variantId") ?? "");
      const variant = variants.find((v) => v.id === variantId);
      setItemCount((c) => c + qty);
      const result = await addItemToCart(prev, formData);
      if (result.error) {
        setItemCount((c) => c - qty);
      } else if (typeof result.itemCount === "number") {
        setItemCount(result.itemCount);
        if (variant) {
          const price = variant.retailPriceCents / 100;
          trackAddToCart(
            {
              item_id: productId ?? variant.sku,
              item_name: productName ?? variant.weightOrFormat,
              item_variant: variant.weightOrFormat,
              price,
              quantity: qty,
            },
            price * qty
          );
        }
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
      // Deduplicate Strict Mode double-effects for server-reconciled ok state
      if (state.itemCount !== lastTracked.current) {
        lastTracked.current = state.itemCount;
      }
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
    <form id={formId} action={formAction} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Format
          <select
            name="variantId"
            defaultValue={defaultId}
            className="field-control min-h-11 rounded-[var(--radius-pill)] border border-[var(--color-border-interactive)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-ink)]"
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

        <label className="flex w-full flex-col gap-1.5 text-[var(--scale-xs)] text-[var(--color-ink-soft)] sm:w-24">
          Qty
          <input
            type="number"
            name="quantity"
            min={1}
            max={20}
            defaultValue={1}
            inputMode="numeric"
            className="field-control min-h-11 rounded-[var(--radius-pill)] border border-[var(--color-border-interactive)] bg-[var(--color-bg)] px-3 py-3 text-[var(--color-ink)]"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary min-h-12 w-full touch-manipulation"
      >
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
