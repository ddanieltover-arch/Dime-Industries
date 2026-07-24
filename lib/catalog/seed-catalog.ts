// lib/catalog/seed-catalog.ts
// Brand catalog imported from dimeindustries.com via scripts/import-brand-catalog.mjs
// PLACEHOLDER_PRICING — replace retail prices from owner price sheet before go-live.

import type { CatalogProduct } from "./types";
import { BRAND_CATALOG, PLACEHOLDER_PRICING } from "./brand-catalog.generated";

export { PLACEHOLDER_PRICING };

export const CATALOG_CATEGORIES = [
  { slug: "vapes", name: "Vapes" },
  { slug: "edibles", name: "Edibles" },
  { slug: "prerolls", name: "Prerolls" },
  { slug: "accessories", name: "Accessories" },
] as const;

export const CATALOG_LINES = [
  { slug: "signature", name: "Signature" },
  { slug: "live-reserve", name: "Live Reserve" },
  { slug: "balanced", name: "Balanced" },
  { slug: "rosin", name: "Rosin" },
  { slug: "state-exclusive", name: "State Exclusive" },
  { slug: "collabs", name: "Collabs" },
] as const;

/** Brand sitemap has no preroll leaf SKUs yet — keep category shoppable. */
const PREROLL_PLACEHOLDER: CatalogProduct = {
  id: "p-dimepack-double-ds",
  slug: "dimepack-double-ds",
  name: "DIMEPACK Double Ds",
  description:
    "DIME prerolls are here. Meet DIMEPACK Double Ds — the donut. Award-winning flower rolled for a premium session.",
  categorySlug: "prerolls",
  categoryName: "Prerolls",
  lineSlug: "signature",
  lineName: "Signature",
  strainType: "hybrid",
  status: "active",
  allowedJurisdictions: ["CA", "MA"],
  effects: ["relaxed", "euphoric"],
  coaUrl: "/lab-results?sku=DIMEPACK_DOUBLE_DS",
  createdAt: "2026-06-01T00:00:00.000Z",
  popularityScore: 80,
  imageUrl: "/brand/hero-poster.jpg",
  galleryUrls: ["/brand/hero-poster.jpg"],
  brandPath: "/products/prerolls",
  variants: [
    {
      id: "v-dimepack-double-ds",
      sku: "DIMEPACK_DOUBLE_DS",
      weightOrFormat: "preroll pack",
      retailPriceCents: 2000,
      thcPct: 28,
      cbdPct: 0.5,
      cbnPct: null,
      quantityOnHand: 100,
    },
  ],
};

export const SEED_CATALOG: CatalogProduct[] = [...BRAND_CATALOG, PREROLL_PLACEHOLDER];
