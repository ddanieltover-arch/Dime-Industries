// lib/catalog/query.ts
// Catalog query layer — pure functions over CatalogProduct[].
// Storefront loads Postgres via loadEffectiveCatalog() → withCatalogSource();
// unit tests and offline fallback use SEED_CATALOG.

import type {
  CatalogFacetCounts,
  CatalogFilters,
  CatalogListResult,
  CatalogProduct,
  CatalogSort,
  CatalogVariant,
  PotencyBand,
  ProductCardModel,
  StrainType,
} from "./types";
import { SEED_CATALOG } from "./seed-catalog";

export function potencyBandFor(thcPct: number): PotencyBand {
  if (thcPct < 50) return "low";
  if (thcPct <= 80) return "high";
  return "very-high";
}

export function primaryVariant(product: CatalogProduct): CatalogVariant {
  return [...product.variants].sort((a, b) => a.retailPriceCents - b.retailPriceCents)[0]!;
}

export function toProductCard(product: CatalogProduct): ProductCardModel {
  const v = primaryVariant(product);
  const strain =
    product.strainType === "na" ? ("hybrid" as const) : product.strainType;
  return {
    slug: product.slug,
    name: product.name,
    line: product.lineName ?? product.categoryName,
    strainType: strain,
    weightOrFormat: v.weightOrFormat,
    retailPriceCents: v.retailPriceCents,
    thcPct: v.thcPct,
    cbdPct: v.cbdPct,
    variantCount: product.variants.length,
    imageUrl: product.imageUrl,
  };
}

function matchesJurisdiction(product: CatalogProduct, jurisdiction: string | null | undefined) {
  if (!jurisdiction) return true;
  return product.allowedJurisdictions.includes(jurisdiction);
}

function matchesQuery(product: CatalogProduct, q: string | undefined) {
  if (!q?.trim()) return true;
  const needle = q.trim().toLowerCase();
  const hay = [
    product.name,
    product.description,
    product.categoryName,
    product.lineName ?? "",
    product.strainType,
    ...product.effects,
    ...product.variants.map((v) => v.sku),
    ...product.variants.map((v) => v.weightOrFormat),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

function matchesFilters(product: CatalogProduct, filters: CatalogFilters): boolean {
  if (product.status !== "active") return false;
  if (!matchesJurisdiction(product, filters.jurisdiction)) return false;
  if (filters.category && product.categorySlug !== filters.category) return false;
  if (filters.line && product.lineSlug !== filters.line) return false;
  if (filters.strain && product.strainType !== filters.strain) return false;
  if (!matchesQuery(product, filters.q)) return false;

  const v = primaryVariant(product);

  if (filters.potency && potencyBandFor(v.thcPct) !== filters.potency) return false;
  if (filters.format && v.weightOrFormat !== filters.format) {
    // Allow match if any variant has the format
    if (!product.variants.some((x) => x.weightOrFormat === filters.format)) return false;
  }
  if (filters.minPriceCents != null && v.retailPriceCents < filters.minPriceCents) return false;
  if (filters.maxPriceCents != null && v.retailPriceCents > filters.maxPriceCents) return false;

  return true;
}

function sortProducts(products: CatalogProduct[], sort: CatalogSort = "popularity") {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort(
        (a, b) => primaryVariant(a).retailPriceCents - primaryVariant(b).retailPriceCents
      );
    case "price-desc":
      return copy.sort(
        (a, b) => primaryVariant(b).retailPriceCents - primaryVariant(a).retailPriceCents
      );
    case "potency-asc":
      return copy.sort((a, b) => primaryVariant(a).thcPct - primaryVariant(b).thcPct);
    case "potency-desc":
      return copy.sort((a, b) => primaryVariant(b).thcPct - primaryVariant(a).thcPct);
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "popularity":
    default:
      return copy.sort((a, b) => b.popularityScore - a.popularityScore);
  }
}

function buildFacets(products: CatalogProduct[]): CatalogFacetCounts {
  const categories = new Map<string, { slug: string; name: string; count: number }>();
  const lines = new Map<string, { slug: string; name: string; count: number }>();
  const strains = new Map<StrainType, number>();
  const potencyBands = new Map<PotencyBand, number>();
  const formats = new Map<string, number>();

  for (const p of products) {
    categories.set(p.categorySlug, {
      slug: p.categorySlug,
      name: p.categoryName,
      count: (categories.get(p.categorySlug)?.count ?? 0) + 1,
    });
    if (p.lineSlug && p.lineName) {
      lines.set(p.lineSlug, {
        slug: p.lineSlug,
        name: p.lineName,
        count: (lines.get(p.lineSlug)?.count ?? 0) + 1,
      });
    }
    strains.set(p.strainType, (strains.get(p.strainType) ?? 0) + 1);
    const band = potencyBandFor(primaryVariant(p).thcPct);
    potencyBands.set(band, (potencyBands.get(band) ?? 0) + 1);
    for (const v of p.variants) {
      formats.set(v.weightOrFormat, (formats.get(v.weightOrFormat) ?? 0) + 1);
    }
  }

  return {
    categories: [...categories.values()].sort((a, b) => a.name.localeCompare(b.name)),
    lines: [...lines.values()].sort((a, b) => a.name.localeCompare(b.name)),
    strains: [...strains.entries()].map(([value, count]) => ({ value, count })),
    potencyBands: [...potencyBands.entries()].map(([value, count]) => ({ value, count })),
    formats: [...formats.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
  };
}

let runtimeSource: CatalogProduct[] | null = null;

export function getCatalogSource(): CatalogProduct[] {
  return runtimeSource ?? SEED_CATALOG;
}

/** Run catalog queries against a temporary source (e.g. admin overrides). */
export function withCatalogSource<T>(source: CatalogProduct[], fn: () => T): T {
  const prev = runtimeSource;
  runtimeSource = source;
  try {
    return fn();
  } finally {
    runtimeSource = prev;
  }
}

export function listProducts(filters: CatalogFilters = {}): CatalogListResult {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 24));

  const jurisdictionScoped = getCatalogSource().filter(
    (p) => p.status === "active" && matchesJurisdiction(p, filters.jurisdiction)
  );

  // Facets reflect the jurisdiction-scoped catalog with other active filters
  // except the facet dimension itself — for Sprint 1 we use filtered-set counts
  // (simpler, honest) rather than full faceted navigation math.
  const filtered = jurisdictionScoped.filter((p) => matchesFilters(p, filters));
  const sorted = sortProducts(filtered, filters.sort ?? "popularity");
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  return {
    items: pageItems.map(toProductCard),
    total,
    page,
    pageSize,
    facets: buildFacets(filtered),
  };
}

export function getProductBySlug(
  slug: string,
  jurisdiction?: string | null
): CatalogProduct | null {
  const product = getCatalogSource().find((p) => p.slug === slug && p.status === "active");
  if (!product) return null;
  if (!matchesJurisdiction(product, jurisdiction)) return null;
  return product;
}

export function getRelatedProducts(
  product: CatalogProduct,
  jurisdiction?: string | null,
  limit = 4
): ProductCardModel[] {
  return listProducts({
    category: product.categorySlug,
    jurisdiction,
    sort: "popularity",
    pageSize: limit + 1,
  }).items.filter((p) => p.slug !== product.slug).slice(0, limit);
}

export function listAllActiveSlugs(jurisdiction?: string | null): string[] {
  return getCatalogSource()
    .filter((p) => p.status === "active" && matchesJurisdiction(p, jurisdiction ?? null))
    .map((p) => p.slug);
}

export function parseCatalogSearchParams(
  params: Record<string, string | string[] | undefined>
): CatalogFilters {
  const one = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const strain = one("strain") as StrainType | undefined;
  const potency = one("potency") as PotencyBand | undefined;
  const sort = one("sort") as CatalogSort | undefined;
  const minPrice = one("minPrice");
  const maxPrice = one("maxPrice");
  const page = one("page");
  const pageSize = one("pageSize");

  return {
    category: one("category"),
    line: one("line"),
    strain: strain && ["sativa", "indica", "hybrid", "na"].includes(strain) ? strain : undefined,
    potency:
      potency && ["low", "high", "very-high"].includes(potency) ? potency : undefined,
    format: one("format"),
    minPriceCents: minPrice ? Number(minPrice) : undefined,
    maxPriceCents: maxPrice ? Number(maxPrice) : undefined,
    q: one("q"),
    sort: sort ?? "popularity",
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 24,
  };
}
