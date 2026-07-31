// lib/catalog/effective.ts
import "server-only";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { loadInventoryOverlay } from "@/lib/inventory";
import { withCatalogSource } from "./query";
import type { CatalogProduct } from "./types";

export async function loadEffectiveCatalog(): Promise<CatalogProduct[]> {
  const catalog = await getAdminCatalog();
  const inventory = await loadInventoryOverlay();
  if (Object.keys(inventory).length === 0) return catalog;

  return catalog.map((product) => ({
    ...product,
    variants: product.variants.map((v) =>
      inventory[v.id] !== undefined ? { ...v, quantityOnHand: inventory[v.id]! } : v
    ),
  }));
}

export async function withEffectiveCatalog<T>(fn: () => T): Promise<T> {
  const catalog = await loadEffectiveCatalog();
  return withCatalogSource(catalog, fn);
}

