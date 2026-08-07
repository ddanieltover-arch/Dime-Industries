// components/cart/add-to-cart-form.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addItemToCart, type CommerceActionState } from "@/app/(commerce)/cart-actions";
import { useCart } from "@/components/cart/cart-provider";
import { trackAddToCart } from "@/lib/analytics/track";
import type { CatalogVariant } from "@/lib/catalog/types";
import type { CartLine, CartSnapshot } from "@/lib/cart/types";

const initial: CommerceActionState = {};

type Props = {
  variants: CatalogVariant[];
  defaultVariantId?: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  /** Stable id so the mobile sticky buy bar can submit this form */
  formId?: string;
};

function optimisticLine(
  variant: CatalogVariant,
  qty: number,
  productName: string,
  productSlug: string,
  productId?: string
): CartLine {
  return {
    variantId: variant.id,
    quantity: qty,
    productSlug: productSlug || productId || variant.sku,
    productName,
    lineName: variant.weightOrFormat,
    weightOrFormat: variant.weightOrFormat,
    sku: variant.sku,
    unitPriceCents: variant.retailPriceCents,
    thcPct: variant.thcPct,
    cbdPct: variant.cbdPct,
    maxQuantity: Math.max(1, variant.quantityOnHand),
  };
}

function mergeOptimisticLine(cart: CartSnapshot, line: CartLine): CartSnapshot {
  const existing = cart.lines.find((l) => l.variantId === line.variantId);
  const lines = existing
    ? cart.lines.map((l) =>
        l.variantId === line.variantId
          ? { ...l, quantity: Math.min(l.maxQuantity, l.quantity + line.quantity) }
          : l
      )
    : [...cart.lines, line];
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalCents = lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
  return { lines, itemCount, subtotalCents };
}

export function AddToCartForm({
  variants,
  defaultVariantId,
  productId,
  productName,
  productSlug,
  formId = "pdp-add-to-cart",
}: Props) {
  const { setItemCount, setCart } = useCart();
  const lastTracked = useRef(0);
  const [justAdded, setJustAdded] = useState(false);
  const rollbackRef = useRef<CartSnapshot | null>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: CommerceActionState, formData: FormData) => {
      const qty = Math.min(20, Math.max(1, Number(formData.get("quantity") ?? 1) || 1));
      const variantId = String(formData.get("variantId") ?? "");
      const variant = variants.find((v) => v.id === variantId);

      setJustAdded(true);
      if (variant) {
        const line = optimisticLine(
          variant,
          qty,
          productName ?? variant.weightOrFormat,
          productSlug ?? "",
          productId
        );
        setCart((current) => {
          rollbackRef.current = current;
          return mergeOptimisticLine(current, line);
        });
      } else {
        setItemCount((c) => c + qty);
      }

      const result = await addItemToCart(prev, formData);
      if (result.error) {
        if (rollbackRef.current) setCart(rollbackRef.current);
        else setItemCount((c) => c - qty);
        setJustAdded(false);
      } else if (result.cart) {
        setCart(result.cart);
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
    if (state.ok && state.cart) {
      setCart(state.cart);
      if (state.itemCount !== lastTracked.current && typeof state.itemCount === "number") {
        lastTracked.current = state.itemCount;
      }
    } else if (state.ok && typeof state.itemCount === "number") {
      setItemCount(state.itemCount);
      if (state.itemCount !== lastTracked.current) {
        lastTracked.current = state.itemCount;
      }
    }
  }, [state.ok, state.itemCount, state.cart, setItemCount, setCart]);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  if (inStock.length === 0) {
    return (
      <p className="border border-[var(--color-flag)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-flag)]">
        Out of stock in your jurisdiction.
      </p>
    );
  }

  const showAdded = justAdded || Boolean(state.ok && !state.error);

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
        disabled={pending && !justAdded}
        className="btn-primary min-h-12 w-full touch-manipulation"
      >
        {showAdded ? "Added to cart" : pending ? "Adding…" : "Add to cart"}
      </button>

      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {showAdded && !state.error ? (
        <p role="status" className="status-pulse text-[var(--scale-sm)] text-[var(--color-resin)]">
          Added to cart.
        </p>
      ) : null}
    </form>
  );
}
