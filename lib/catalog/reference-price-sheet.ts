/**
 * Reference retail prices for DIME catalog SKUs.
 *
 * Primary source: https://www.eaze.com/brands/dime (CA delivery menu, Jul 2026)
 * Secondary: https://rollingreleaf.com/marijuana-delivery/brands/dime-industries/ (MA)
 * Note: https://www.wholemeltscarts.us/ is Whole Melt Extracts — not DIME; ignored.
 *
 * Brand-site SKUs map to Eaze AIO / Live Reserve AIO listings when available.
 * Categories with no marketplace listing use documented band estimates.
 */
export const PRICE_SOURCES = {
  eaze: "https://www.eaze.com/brands/dime",
  rollingReleaf: "https://rollingreleaf.com/marijuana-delivery/brands/dime-industries/",
} as const;

/** Line / category defaults when no per-SKU marketplace hit (cents). */
export const REFERENCE_PRICE_BANDS: Record<string, number> = {
  signature: 4000, // Eaze Signature AIO 1g = $40
  "live-reserve": 4300, // Eaze Live Reserve AIO 1g = $43
  balanced: 5800, // Eaze Balanced 2g AIO = $58
  rosin: 5500, // no Eaze/RR listing — premium band above Live Reserve
  "state-exclusive": 4000, // Tropicali listed as Signature AIO $40 on Eaze
  collabs: 5000, // no Eaze listing; between Signature and MA 2g collab shelf
  gummies: 2500, // no DIME edible listings on Eaze/RR — estimated
  softgels: 2800, // estimated
  prerolls: 2000, // estimated
  accessories: 3000, // Eaze 510 batteries $28–$30
  default: 4000,
};

/**
 * Per-slug overrides from marketplace scrapes.
 * source: eaze | rolling-releaf | band
 */
export type ReferencePrice = {
  retailPriceCents: number;
  source: "eaze" | "rolling-releaf" | "band";
  note?: string;
};

/** Explicit Eaze menu matches (and accessory SKUs). */
export const REFERENCE_PRICE_OVERRIDES: Record<string, ReferencePrice> = {
  // Accessories — Eaze
  "5th-gen-mini": {
    retailPriceCents: 2800,
    source: "eaze",
    note: "Eaze Mini 510 Thread Battery $28",
  },
  "5th-gen-battery": {
    retailPriceCents: 3000,
    source: "eaze",
    note: "Eaze 510 / Variable Voltage Battery $30",
  },

  // Signature AIO 1g — Eaze $40
  guavalicious: { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "lime-sherbanger": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "key-lime-pie": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "pink-rose": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "forbidden-apple": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "blueberry-lemon-haze": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "peach-kush": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "wedding-cake": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "watermelon-kush": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "sour-grape": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "mango-diesel": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "pink-lemon-haze": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "tropical-kiwi": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "banana-punch": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "red-plum": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "cantaloupe-dream": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "blackberry-og": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "berry-white": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  tropicali: { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "strawberry-cough": { retailPriceCents: 4000, source: "eaze", note: "Signature AIO 1g $40" },
  "paradise-passion": {
    retailPriceCents: 3600,
    source: "eaze",
    note: "Eaze Passion Paradise 1g tank $36 (no AIO listing)",
  },
  "pina-colada": { retailPriceCents: 3600, source: "eaze", note: "Eaze Pina Colada 1g $36" },
  "royal-pear": { retailPriceCents: 3600, source: "eaze", note: "Eaze Royal Pear 1g $36" },
  watermelon: {
    retailPriceCents: 2500,
    source: "band",
    note: "Rosin gummies — no Eaze edible listing; band estimate",
  },

  // Live Reserve AIO 1g — Eaze $43
  chocolope: { retailPriceCents: 4300, source: "eaze", note: "Live Reserve AIO 1g $43" },
  "dime-og": { retailPriceCents: 4300, source: "eaze", note: "Live Reserve AIO 1g $43" },
  "grape-limeade": { retailPriceCents: 4300, source: "eaze", note: "Live Reserve AIO 1g $43" },
  papaya: { retailPriceCents: 4300, source: "eaze", note: "Live Reserve AIO 1g $43" },
  "king-louis-xiii": { retailPriceCents: 4300, source: "eaze", note: "Live Reserve AIO 1g $43" },
  "peach-mojito": { retailPriceCents: 4300, source: "eaze", note: "Live Reserve AIO 1g $43" },
  "jet-fuel": {
    retailPriceCents: 4300,
    source: "eaze",
    note: "Eaze Live Reserve AIO $43; Rolling Releaf MA Live Resin 1g $65",
  },
  kushmint: { retailPriceCents: 4300, source: "eaze", note: "Kush Mint Live Reserve AIO 1g $43" },
  "banana-mac": { retailPriceCents: 4300, source: "eaze", note: "Live Reserve AIO 1g $43" },
  "miami-ice": { retailPriceCents: 4300, source: "eaze", note: "Live Reserve AIO 1g $43" },
  "watermelon-og": {
    retailPriceCents: 4300,
    source: "eaze",
    note: "Live Reserve band $43 (Eaze); Rolling Releaf MA Live Resin 1g $65",
  },

  // Balanced 2g AIO — Eaze $58
  "lemon-pound-cake": { retailPriceCents: 5800, source: "eaze", note: "1:1:1 AIO 2g $58" },
  "mowie-wowie": { retailPriceCents: 5800, source: "eaze", note: "1:1:1 AIO 2g $58" },
  "mint-og": { retailPriceCents: 5800, source: "eaze", note: "1:1 THC:CBD AIO 2g $58" },

  // Collabs with MA shelf evidence (use CA-leaning mid; RR is 2g $75)
  "peach-ice-t": {
    retailPriceCents: 5000,
    source: "band",
    note: "Rolling Releaf MA 2g disposable $75; CA 1g collab estimate $50",
  },
};

/** MA Rolling Releaf shelf (informational — not applied as primary retail). */
export const ROLLING_RELEAF_MA_SHELF: Record<string, number> = {
  "watermelon-og": 6500,
  "pink-rose": 7500, // listed as 2g
  "peach-ice-t": 7500, // 2g
  "jet-fuel": 6500,
  "wedding-cake": 7500, // 2g
  "key-lime-pie": 7500, // 2g
  "berry-white": 7500, // 2g
};

export function resolveReferencePrice(input: {
  slug: string;
  lineSlug: string | null;
  categorySlug: string;
  format: string;
}): ReferencePrice {
  const override = REFERENCE_PRICE_OVERRIDES[input.slug];
  if (override) return override;

  let bandKey = "default";
  if (input.categorySlug === "accessories") bandKey = "accessories";
  else if (input.format === "gummies") bandKey = "gummies";
  else if (input.format === "softgels") bandKey = "softgels";
  else if (input.format === "preroll") bandKey = "prerolls";
  else if (input.lineSlug && REFERENCE_PRICE_BANDS[input.lineSlug] != null) bandKey = input.lineSlug;

  return {
    retailPriceCents: REFERENCE_PRICE_BANDS[bandKey] ?? REFERENCE_PRICE_BANDS.default,
    source: "band",
    note: `Band ${bandKey} from Eaze-derived defaults`,
  };
}
