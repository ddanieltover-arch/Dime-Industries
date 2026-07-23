// lib/cart/logic.ts
// Pure cart mutations — no I/O. Safe for unit tests.

import type { CatalogProduct, CatalogVariant } from "@/lib/catalog/types";
import type { CartLine, CartLineInput, CartSnapshot } from "./types";
import { CART_MAX_LINES, CART_MAX_QTY_PER_LINE } from "./types";

export type CartLookup = {
  findVariant(
    variantId: string
  ): { product: CatalogProduct; variant: CatalogVariant } | null;
};

function clampQty(qty: number, max: number, absoluteMax = CART_MAX_QTY_PER_LINE) {
  if (!Number.isFinite(qty) || qty < 1) return 1;
  return Math.min(Math.floor(qty), Math.min(max, absoluteMax));
}

export function toCartLine(
  product: CatalogProduct,
  variant: CatalogVariant,
  quantity: number,
  options?: { absoluteMaxQty?: number }
): CartLine {
  const absoluteMax = options?.absoluteMaxQty ?? CART_MAX_QTY_PER_LINE;
  const maxQuantity = Math.max(1, Math.min(variant.quantityOnHand, absoluteMax));
  return {
    variantId: variant.id,
    quantity: clampQty(quantity, maxQuantity, absoluteMax),
    productSlug: product.slug,
    productName: product.name,
    lineName: product.lineName ?? product.categoryName,
    weightOrFormat: variant.weightOrFormat,
    sku: variant.sku,
    unitPriceCents: variant.retailPriceCents,
    thcPct: variant.thcPct,
    cbdPct: variant.cbdPct,
    maxQuantity,
  };
}

export function hydrateCart(
  raw: CartLineInput[],
  lookup: CartLookup,
  options?: { absoluteMaxQty?: number; maxLines?: number }
): CartLine[] {
  const maxLines = options?.maxLines ?? CART_MAX_LINES;
  const lines: CartLine[] = [];
  for (const item of raw) {
    const found = lookup.findVariant(item.variantId);
    if (!found) continue;
    if (found.variant.quantityOnHand <= 0) continue;
    lines.push(toCartLine(found.product, found.variant, item.quantity, options));
    if (lines.length >= maxLines) break;
  }
  return lines;
}

export function cartSnapshot(lines: CartLine[]): CartSnapshot {
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalCents = lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
  return { lines, itemCount, subtotalCents };
}

export function addToCart(
  lines: CartLine[],
  product: CatalogProduct,
  variant: CatalogVariant,
  quantity = 1
): CartLine[] {
  if (variant.quantityOnHand <= 0) return lines;
  const existing = lines.find((l) => l.variantId === variant.id);
  if (existing) {
    return lines.map((l) =>
      l.variantId === variant.id
        ? toCartLine(product, variant, l.quantity + quantity)
        : l
    );
  }
  if (lines.length >= CART_MAX_LINES) return lines;
  return [...lines, toCartLine(product, variant, quantity)];
}

export function updateCartQuantity(
  lines: CartLine[],
  variantId: string,
  quantity: number,
  lookup: CartLookup
): CartLine[] {
  if (quantity <= 0) return removeFromCart(lines, variantId);
  const found = lookup.findVariant(variantId);
  if (!found) return lines.filter((l) => l.variantId !== variantId);
  return lines.map((l) =>
    l.variantId === variantId ? toCartLine(found.product, found.variant, quantity) : l
  );
}

export function removeFromCart(lines: CartLine[], variantId: string): CartLine[] {
  return lines.filter((l) => l.variantId !== variantId);
}

/** Merge guest cart into existing (e.g. post-login). Guest quantities add onto matching lines. */
export function mergeCarts(existing: CartLine[], guest: CartLine[]): CartLine[] {
  let result = [...existing];
  for (const g of guest) {
    const hit = result.find((l) => l.variantId === g.variantId);
    if (hit) {
      result = result.map((l) =>
        l.variantId === g.variantId
          ? {
              ...l,
              quantity: Math.min(l.maxQuantity, l.quantity + g.quantity),
            }
          : l
      );
    } else if (result.length < CART_MAX_LINES) {
      result = [...result, g];
    }
  }
  return result;
}

export function serializeCartInputs(lines: CartLine[]): CartLineInput[] {
  return lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
}
