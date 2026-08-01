// lib/data/products.ts
// Home page adapter over the Catalog Service (Sprint 1).

import { listProducts, withCatalogSource, type ProductCardModel } from "@/lib/catalog";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { CATALOG_LINES } from "@/lib/catalog/seed-catalog";
import { applyLiveCoaToCards } from "@/lib/integrations/coa/client";

export type FeaturedProduct = ProductCardModel;

export type ProductLineSection = {
  slug: string;
  name: string;
  products: ProductCardModel[];
};

export async function getFeaturedProductLines(): Promise<ProductLineSection[]> {
  const catalog = await loadEffectiveCatalog();

  const sections = withCatalogSource(catalog, () =>
    CATALOG_LINES.map((line) => {
      const { items } = listProducts({
        line: line.slug,
        sort: "popularity",
        pageSize: 6,
      });
      return { slug: line.slug, name: line.name, products: items };
    }).filter((section) => section.products.length > 0)
  );

  return Promise.all(
    sections.map(async (section) => ({
      ...section,
      products: await applyLiveCoaToCards(section.products),
    }))
  );
}

export async function getFeaturedBundles(): Promise<ProductLineSection | null> {
  const catalog = await loadEffectiveCatalog();
  const section = withCatalogSource(catalog, () => {
    const { items } = listProducts({
      category: "bundles",
      sort: "popularity",
      pageSize: 6,
    });
    if (items.length === 0) return null;
    return { slug: "bundles", name: "Bundles", products: items };
  });
  if (!section) return null;
  return {
    ...section,
    products: await applyLiveCoaToCards(section.products),
  };
}
