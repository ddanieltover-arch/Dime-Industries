// lib/catalog/suggest.ts
// Autocomplete suggestions over CatalogProduct[] — pure, unit-testable.

import type { CatalogProduct } from "./types";
import { getCatalogSource, primaryVariant } from "./query";

export type ProductSuggestion = {
  kind: "product";
  slug: string;
  name: string;
  line: string;
  href: string;
  thcPct: number;
  imageUrl: string | null;
  score: number;
};

export type TaxonomySuggestion = {
  kind: "category" | "line";
  slug: string;
  name: string;
  href: string;
  score: number;
};

export type SearchSuggestion = ProductSuggestion | TaxonomySuggestion;

export type SuggestResult = {
  query: string;
  suggestions: SearchSuggestion[];
};

function scoreHaystack(needle: string, ...fields: string[]): number {
  const n = needle.toLowerCase();
  let best = 0;
  for (const raw of fields) {
    const f = raw.toLowerCase();
    if (!f) continue;
    if (f === n) best = Math.max(best, 100);
    else if (f.startsWith(n)) best = Math.max(best, 80);
    else if (f.includes(` ${n}`) || f.includes(`-${n}`)) best = Math.max(best, 60);
    else if (f.includes(n)) best = Math.max(best, 40);
  }
  return best;
}

function matchesJurisdiction(product: CatalogProduct, jurisdiction: string | null | undefined) {
  if (!jurisdiction) return true;
  return product.allowedJurisdictions.includes(jurisdiction);
}

/**
 * Ranked autocomplete hits for products + matching category/line labels.
 * Min query length is enforced by the caller (typically ≥ 2).
 */
export function suggestCatalog(
  q: string,
  options: { jurisdiction?: string | null; limit?: number } = {}
): SuggestResult {
  const query = q.trim();
  const limit = Math.min(12, Math.max(1, options.limit ?? 8));
  if (query.length < 2) {
    return { query, suggestions: [] };
  }

  const jurisdiction = options.jurisdiction ?? null;
  const products = getCatalogSource().filter(
    (p) => p.status === "active" && matchesJurisdiction(p, jurisdiction)
  );

  const productHits: ProductSuggestion[] = [];
  for (const p of products) {
    const skus = p.variants.map((v) => v.sku);
    const formats = p.variants.map((v) => v.weightOrFormat);
    const score = scoreHaystack(
      query,
      p.name,
      p.slug.replace(/-/g, " "),
      p.lineName ?? "",
      p.categoryName,
      p.strainType,
      ...p.effects,
      ...skus,
      ...formats
    );
    if (score <= 0) continue;
    const popularityBoost = Math.min(10, Math.round(p.popularityScore / 20));
    const v = primaryVariant(p);
    productHits.push({
      kind: "product",
      slug: p.slug,
      name: p.name,
      line: p.lineName ?? p.categoryName,
      href: `/product/${p.slug}`,
      thcPct: v.thcPct,
      imageUrl: p.imageUrl,
      score: score + popularityBoost,
    });
  }
  productHits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const categories = new Map<string, { slug: string; name: string }>();
  const lines = new Map<string, { slug: string; name: string; categorySlug: string }>();
  for (const p of products) {
    categories.set(p.categorySlug, { slug: p.categorySlug, name: p.categoryName });
    if (p.lineSlug && p.lineName) {
      lines.set(p.lineSlug, {
        slug: p.lineSlug,
        name: p.lineName,
        categorySlug: p.categorySlug,
      });
    }
  }

  const taxonomyHits: TaxonomySuggestion[] = [];
  for (const c of categories.values()) {
    const score = scoreHaystack(query, c.name, c.slug.replace(/-/g, " "));
    if (score <= 0) continue;
    taxonomyHits.push({
      kind: "category",
      slug: c.slug,
      name: c.name,
      href: `/shop/${c.slug}`,
      score: score + 5,
    });
  }
  for (const l of lines.values()) {
    const score = scoreHaystack(query, l.name, l.slug.replace(/-/g, " "));
    if (score <= 0) continue;
    taxonomyHits.push({
      kind: "line",
      slug: l.slug,
      name: l.name,
      href: `/shop/${l.categorySlug}/${l.slug}`,
      score,
    });
  }
  taxonomyHits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const suggestions: SearchSuggestion[] = [
    ...taxonomyHits.slice(0, 3),
    ...productHits.slice(0, Math.max(0, limit - Math.min(3, taxonomyHits.length))),
  ].slice(0, limit);

  return { query, suggestions };
}
