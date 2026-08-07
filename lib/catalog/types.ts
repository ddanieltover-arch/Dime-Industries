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
  /** Primary product image (self-hosted under /public/catalog) */
  imageUrl: string | null;
  galleryUrls: string[];
  /** Source path on dimeindustries.com */
  brandPath: string | null;
  /** When set, this SKU is a package of other catalog products */
  bundleComponents?: { productSlug: string; quantity: number }[];
  /** Pre-discount sum of component retail (for savings UI) */
  compareAtPriceCents?: number | null;
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
  /** Primary (lowest-price) variant — used for grid-level add to cart */
  primaryVariantId: string;
  /** True when at least one variant has stock */
  inStock: boolean;
  imageUrl: string | null;
  /** Primary variant SKU — lab results / COA lookups */
  primarySku: string;
  /** Catalog COA document URL when present */
  coaUrl: string | null;
  /** True when the live lab host returned a COA for this SKU */
  coaLive: boolean;
  /** Bundle package (category bundles or explicit components) */
  isBundle: boolean;
  /** Strikethrough price when bundle saves vs components */
  compareAtPriceCents: number | null;
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

/** Default products per page on shop + category catalog routes. */
export const CATALOG_DEFAULT_PAGE_SIZE = 6;

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
