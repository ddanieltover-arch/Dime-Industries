// lib/catalog/effective.ts
import "server-only";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { loadInventoryOverlay } from "@/lib/inventory";
import { materializeBundles } from "./bundles";
import { withCatalogSource } from "./query";
import type { CatalogProduct } from "./types";

export async function loadEffectiveCatalog(): Promise<CatalogProduct[]> {
  const catalog = await getAdminCatalog();
  const inventory = await loadInventoryOverlay();
  const withStock =
    Object.keys(inventory).length === 0
      ? catalog
      : catalog.map((product) => ({
          ...product,
          variants: product.variants.map((v) =>
            inventory[v.id] !== undefined ? { ...v, quantityOnHand: inventory[v.id]! } : v
          ),
        }));

  // Rebuild bundles from current component stock so package qty stays honest.
  const base = withStock.filter((p) => p.categorySlug !== "bundles");
  return [...base, ...materializeBundles(base)];
}

export async function withEffectiveCatalog<T>(fn: () => T): Promise<T> {
  const catalog = await loadEffectiveCatalog();
  return withCatalogSource(catalog, fn);
}

