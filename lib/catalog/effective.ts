// lib/catalog/effective.ts
import "server-only";
import { cache } from "react";
import { getAdminCatalog } from "@/lib/admin/catalog-overrides";
import { loadInventoryOverlay } from "@/lib/inventory";
import { withTimeout } from "@/lib/async/with-timeout";
import { SEED_CATALOG } from "./seed-catalog";
import { materializeBundles } from "./bundles";
import { withCatalogSource } from "./query";
import type { CatalogProduct } from "./types";

const EFFECTIVE_CATALOG_TIMEOUT_MS = 3_000;

function withBundles(products: CatalogProduct[]): CatalogProduct[] {
  const base = products.filter((p) => p.categorySlug !== "bundles");
  return [...base, ...materializeBundles(base)];
}

/**
 * Request-memoized effective catalog (overrides + stock + bundles).
 * Cart actions call this once; avoid duplicate work in the same request.
 * Times out to seed so /shop never sits on loading.tsx waiting for Postgres.
 */
export const loadEffectiveCatalog = cache(async (): Promise<CatalogProduct[]> => {
  try {
    return await withTimeout(
      (async () => {
        const [catalog, inventory] = await Promise.all([
          getAdminCatalog(),
          loadInventoryOverlay(),
        ]);
        const withStock =
          Object.keys(inventory).length === 0
            ? catalog
            : catalog.map((product) => ({
                ...product,
                variants: product.variants.map((v) =>
                  inventory[v.id] !== undefined
                    ? { ...v, quantityOnHand: inventory[v.id]! }
                    : v
                ),
              }));
        return withBundles(withStock);
      })(),
      EFFECTIVE_CATALOG_TIMEOUT_MS,
      "effective-catalog"
    );
  } catch (err) {
    console.error("[catalog] effective load failed, using seed catalog", err);
    return SEED_CATALOG;
  }
});

export async function withEffectiveCatalog<T>(fn: () => T): Promise<T> {
  const catalog = await loadEffectiveCatalog();
  return withCatalogSource(catalog, fn);
}
