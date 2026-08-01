// lib/admin/catalog-override-logic.ts — pure helpers (unit-testable)

export type VariantOverride = {
  retailPriceCents?: number;
  quantityOnHand?: number;
};

export type ProductOverride = {
  status?: "draft" | "active" | "archived";
  name?: string;
  variants?: Record<string, VariantOverride>;
};

export type CatalogOverrides = Record<string, ProductOverride>;

/** True when any override fields exist for this catalog product id. */
export function hasProductOverride(overrides: CatalogOverrides, productId: string): boolean {
  const o = overrides[productId];
  if (!o) return false;
  if (o.name != null || o.status != null) return true;
  return Boolean(o.variants && Object.keys(o.variants).length > 0);
}
