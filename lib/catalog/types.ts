// lib/catalog/types.ts
// Catalog domain types — shaped to match db/schema products / variants / potency
// so the in-memory catalog can swap to Drizzle without rewriting the UI.

export type StrainType = "sativa" | "indica" | "hybrid" | "na";

export type PotencyBand = "low" | "high" | "very-high";

export type CatalogSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "potency-asc"
  | "potency-desc"
  | "name-asc"
  | "popularity";

export type CatalogVariant = {
  id: string;
  sku: string;
  weightOrFormat: string;
  retailPriceCents: number;
  thcPct: number;
  cbdPct: number;
  cbnPct: number | null;
  quantityOnHand: number;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  lineSlug: string | null;
  lineName: string | null;
  strainType: StrainType;
  status: "draft" | "active" | "archived";
  allowedJurisdictions: string[];
  effects: string[];
  coaUrl: string | null;
  createdAt: string; // ISO
  variants: CatalogVariant[];
  /** Soft popularity signal until real order analytics exist */
  popularityScore: number;
};

/** Card-facing projection used by ProductCard and home rails */
export type ProductCardModel = {
  slug: string;
  name: string;
  line: string;
  strainType: Exclude<StrainType, "na">;
  weightOrFormat: string;
  retailPriceCents: number;
  thcPct: number;
  cbdPct: number;
  variantCount: number;
};

export type CatalogFilters = {
  category?: string;
  line?: string;
  strain?: StrainType;
  potency?: PotencyBand;
  format?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  q?: string;
  sort?: CatalogSort;
  jurisdiction?: string | null;
  page?: number;
  pageSize?: number;
};

export type CatalogFacetCounts = {
  categories: { slug: string; name: string; count: number }[];
  lines: { slug: string; name: string; count: number }[];
  strains: { value: StrainType; count: number }[];
  potencyBands: { value: PotencyBand; count: number }[];
  formats: { value: string; count: number }[];
};

export type CatalogListResult = {
  items: ProductCardModel[];
  total: number;
  page: number;
  pageSize: number;
  facets: CatalogFacetCounts;
};
