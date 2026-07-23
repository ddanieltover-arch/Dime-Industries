// lib/wholesale/pricing.ts
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog/types";
import {
  WHOLESALE_DEFAULT_MOQ,
  WHOLESALE_PRICE_BPS,
  type WholesalePriceOverride,
} from "./types";

export type WholesaleVariantPrice = {
  variantId: string;
  retailPriceCents: number;
  wholesalePriceCents: number;
  minQuantity: number;
};

export function defaultWholesalePriceCents(retailPriceCents: number): number {
  return Math.max(1, Math.round((retailPriceCents * WHOLESALE_PRICE_BPS) / 10000));
}

export function resolveWholesaleVariantPrice(
  variant: CatalogVariant,
  overrides: Record<string, WholesalePriceOverride>
): WholesaleVariantPrice {
  const override = overrides[variant.id];
  return {
    variantId: variant.id,
    retailPriceCents: variant.retailPriceCents,
    wholesalePriceCents: override?.priceCents ?? defaultWholesalePriceCents(variant.retailPriceCents),
    minQuantity: override?.minQuantity ?? WHOLESALE_DEFAULT_MOQ,
  };
}

export function applyWholesalePricing(
  products: CatalogProduct[],
  overrides: Record<string, WholesalePriceOverride>
): CatalogProduct[] {
  return products.map((product) => ({
    ...product,
    variants: product.variants.map((v) => {
      const priced = resolveWholesaleVariantPrice(v, overrides);
      return {
        ...v,
        retailPriceCents: priced.wholesalePriceCents,
        // Reuse quantityOnHand; MOQ enforced in cart via max/min helpers
      };
    }),
  }));
}

export function termsLabel(terms: string): string {
  switch (terms) {
    case "net30":
      return "NET-30";
    case "net60":
      return "NET-60";
    case "upfront":
      return "Pay upfront (Bitcoin)";
    default:
      return terms;
  }
}
