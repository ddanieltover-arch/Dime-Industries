// lib/data/products.ts
// Home page adapter over the Catalog Service (Sprint 1).

import { listProducts, withCatalogSource, type ProductCardModel } from "@/lib/catalog";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { CATALOG_LINES } from "@/lib/catalog/seed-catalog";

export type FeaturedProduct = ProductCardModel;

export type ProductLineSection = {
  slug: string;
  name: string;
  products: ProductCardModel[];
};

export async function getFeaturedProductLines(): Promise<ProductLineSection[]> {
  const catalog = await loadEffectiveCatalog();

  return withCatalogSource(catalog, () =>
    CATALOG_LINES.map((line) => {
      const { items } = listProducts({
        line: line.slug,
        sort: "popularity",
        pageSize: 6,
      });
      return { slug: line.slug, name: line.name, products: items };
    }).filter((section) => section.products.length > 0)
  );
}
