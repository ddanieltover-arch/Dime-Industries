// lib/cart/catalog-lookup.ts
import { getCatalogSource } from "@/lib/catalog/query";
import type { CatalogProduct } from "@/lib/catalog/types";
import type { CartLookup } from "./logic";

export function createCatalogLookup(products?: CatalogProduct[]): CartLookup {
  const source = products ?? getCatalogSource();
  return {
    findVariant(variantId: string) {
      for (const product of source) {
        if (product.status !== "active") continue;
        const variant = product.variants.find((v) => v.id === variantId);
        if (variant) return { product, variant };
      }
      return null;
    },
  };
}

export function findVariantAcrossCatalog(variantId: string, products?: CatalogProduct[]) {
  return createCatalogLookup(products).findVariant(variantId);
}
