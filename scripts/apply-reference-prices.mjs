/**
 * scripts/apply-reference-prices.mjs
 *
 * Patches lib/catalog/brand-catalog.generated.ts retailPriceCents from
 * marketplace reference prices (Eaze CA + Rolling Releaf MA notes).
 *
 * Usage: node scripts/apply-reference-prices.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const GENERATED = path.join(ROOT, "lib", "catalog", "brand-catalog.generated.ts");
const SEED = path.join(ROOT, "lib", "catalog", "seed-catalog.ts");

const sheetUrl = pathToFileURL(
  path.join(ROOT, "lib", "catalog", "reference-price-sheet.ts")
).href;

// Load via dynamic import — TypeScript is emitted as TS; use a small inline
// duplicate of resolve logic so we don't need a TS loader.
const PRICE_BANDS = {
  signature: 4000,
  "live-reserve": 4300,
  balanced: 5800,
  rosin: 5500,
  "state-exclusive": 4000,
  collabs: 5000,
  gummies: 2500,
  softgels: 2800,
  prerolls: 2000,
  accessories: 3000,
  default: 4000,
};

/** @type {Record<string, { retailPriceCents: number; source: string; note?: string }>} */
const OVERRIDES = {
  "5th-gen-mini": { retailPriceCents: 2800, source: "eaze" },
  "5th-gen-battery": { retailPriceCents: 3000, source: "eaze" },
  guavalicious: { retailPriceCents: 4000, source: "eaze" },
  "lime-sherbanger": { retailPriceCents: 4000, source: "eaze" },
  "key-lime-pie": { retailPriceCents: 4000, source: "eaze" },
  "pink-rose": { retailPriceCents: 4000, source: "eaze" },
  "forbidden-apple": { retailPriceCents: 4000, source: "eaze" },
  "blueberry-lemon-haze": { retailPriceCents: 4000, source: "eaze" },
  "peach-kush": { retailPriceCents: 4000, source: "eaze" },
  "wedding-cake": { retailPriceCents: 4000, source: "eaze" },
  "watermelon-kush": { retailPriceCents: 4000, source: "eaze" },
  "sour-grape": { retailPriceCents: 4000, source: "eaze" },
  "mango-diesel": { retailPriceCents: 4000, source: "eaze" },
  "pink-lemon-haze": { retailPriceCents: 4000, source: "eaze" },
  "tropical-kiwi": { retailPriceCents: 4000, source: "eaze" },
  "banana-punch": { retailPriceCents: 4000, source: "eaze" },
  "red-plum": { retailPriceCents: 4000, source: "eaze" },
  "cantaloupe-dream": { retailPriceCents: 4000, source: "eaze" },
  "blackberry-og": { retailPriceCents: 4000, source: "eaze" },
  "berry-white": { retailPriceCents: 4000, source: "eaze" },
  tropicali: { retailPriceCents: 4000, source: "eaze" },
  "strawberry-cough": { retailPriceCents: 4000, source: "eaze" },
  "paradise-passion": { retailPriceCents: 3600, source: "eaze" },
  "pina-colada": { retailPriceCents: 3600, source: "eaze" },
  "royal-pear": { retailPriceCents: 3600, source: "eaze" },
  chocolope: { retailPriceCents: 4300, source: "eaze" },
  "dime-og": { retailPriceCents: 4300, source: "eaze" },
  "grape-limeade": { retailPriceCents: 4300, source: "eaze" },
  papaya: { retailPriceCents: 4300, source: "eaze" },
  "king-louis-xiii": { retailPriceCents: 4300, source: "eaze" },
  "peach-mojito": { retailPriceCents: 4300, source: "eaze" },
  "jet-fuel": { retailPriceCents: 4300, source: "eaze" },
  kushmint: { retailPriceCents: 4300, source: "eaze" },
  "banana-mac": { retailPriceCents: 4300, source: "eaze" },
  "miami-ice": { retailPriceCents: 4300, source: "eaze" },
  "watermelon-og": { retailPriceCents: 4300, source: "eaze" },
  "lemon-pound-cake": { retailPriceCents: 5800, source: "eaze" },
  "mowie-wowie": { retailPriceCents: 5800, source: "eaze" },
  "mint-og": { retailPriceCents: 5800, source: "eaze" },
  "peach-ice-t": { retailPriceCents: 5000, source: "band" },
};

function resolvePrice(slug, lineSlug, categorySlug, format) {
  if (OVERRIDES[slug]) return OVERRIDES[slug];
  let bandKey = "default";
  if (categorySlug === "accessories") bandKey = "accessories";
  else if (format === "gummies") bandKey = "gummies";
  else if (format === "softgels") bandKey = "softgels";
  else if (format === "preroll") bandKey = "prerolls";
  else if (lineSlug && PRICE_BANDS[lineSlug] != null) bandKey = lineSlug;
  return {
    retailPriceCents: PRICE_BANDS[bandKey],
    source: "band",
    note: bandKey,
  };
}

function main() {
  void sheetUrl; // reserved for future TS loader
  let src = fs.readFileSync(GENERATED, "utf8");

  // Split into product objects by top-level `{ id:` within the array
  const headerMatch = src.match(/^([\s\S]*?export const BRAND_CATALOG[^=]*=\s*\[)/);
  const footerMatch = src.match(/(\];\s*)$/);
  if (!headerMatch || !footerMatch) {
    throw new Error("Could not parse BRAND_CATALOG array bounds");
  }

  const start = headerMatch[0].length;
  const end = src.length - footerMatch[1].length;
  const body = src.slice(start, end);

  // Parse product blocks by brace depth
  const products = [];
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /\s|,/.test(body[i])) i++;
    if (i >= body.length) break;
    if (body[i] !== "{") {
      throw new Error(`Expected product object at ${i}`);
    }
    let depth = 0;
    const startIdx = i;
    for (; i < body.length; i++) {
      if (body[i] === "{") depth++;
      else if (body[i] === "}") {
        depth--;
        if (depth === 0) {
          i++;
          products.push(body.slice(startIdx, i));
          break;
        }
      }
    }
  }

  const stats = { eaze: 0, band: 0, total: 0 };
  const updated = products.map((block) => {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const lineRaw = block.match(/lineSlug:\s*([^,\n]+)/)?.[1]?.trim();
    const lineSlug = lineRaw === "null" ? null : lineRaw?.replace(/"/g, "") ?? null;
    const categorySlug = block.match(/categorySlug:\s*"([^"]+)"/)?.[1] ?? "vapes";
    const format = block.match(/weightOrFormat:\s*"([^"]+)"/)?.[1] ?? "1g";
    if (!slug) throw new Error("Product missing slug");

    const price = resolvePrice(slug, lineSlug, categorySlug, format);
    stats.total++;
    if (price.source === "eaze") stats.eaze++;
    else stats.band++;

    return block.replace(
      /retailPriceCents:\s*\d+/,
      `retailPriceCents: ${price.retailPriceCents}`
    );
  });

  const newHeader = `// AUTO-GENERATED by scripts/import-brand-catalog.mjs + scripts/apply-reference-prices.mjs
// Do not edit by hand — re-run catalog:import then catalog:prices.
// REFERENCE_PRICING=true — retailPriceCents from Eaze CA menu (+ Rolling Releaf MA notes).
// Sources: https://www.eaze.com/brands/dime · https://rollingreleaf.com/marijuana-delivery/brands/dime-industries/
// wholemeltscarts.us is Whole Melt Extracts (not DIME) — not used.
// Generated: ${new Date().toISOString()}

import type { CatalogProduct } from "./types";

export const PLACEHOLDER_PRICING = false as const;
export const REFERENCE_PRICING = true as const;

export const BRAND_CATALOG: CatalogProduct[] = [`;

  const out = `${newHeader}${updated.join(",\n")}\n];\n`;
  fs.writeFileSync(GENERATED, out);

  // Keep seed comment in sync
  if (fs.existsSync(SEED)) {
    let seed = fs.readFileSync(SEED, "utf8");
    seed = seed.replace(
      /\/\/ PLACEHOLDER_PRICING[^\n]*/,
      "// REFERENCE_PRICING — retail prices from Eaze/Rolling Releaf sheet (see reference-price-sheet.ts)."
    );
    seed = seed.replace(
      /export \{ PLACEHOLDER_PRICING \};/,
      "export { PLACEHOLDER_PRICING, REFERENCE_PRICING };"
    );
    if (!seed.includes("REFERENCE_PRICING")) {
      seed = seed.replace(
        'import { BRAND_CATALOG, PLACEHOLDER_PRICING } from "./brand-catalog.generated";',
        'import { BRAND_CATALOG, PLACEHOLDER_PRICING, REFERENCE_PRICING } from "./brand-catalog.generated";'
      );
    } else {
      seed = seed.replace(
        /import \{ BRAND_CATALOG, PLACEHOLDER_PRICING \} from "\.\/brand-catalog\.generated";/,
        'import { BRAND_CATALOG, PLACEHOLDER_PRICING, REFERENCE_PRICING } from "./brand-catalog.generated";'
      );
    }
    fs.writeFileSync(SEED, seed);
  }

  console.log(`Updated ${stats.total} SKUs (${stats.eaze} Eaze overrides, ${stats.band} band/estimated)`);
  console.log(`Wrote ${path.relative(ROOT, GENERATED)}`);
}

main();
