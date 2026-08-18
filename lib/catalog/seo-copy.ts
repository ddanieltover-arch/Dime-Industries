// lib/catalog/seo-copy.ts — SEO product descriptions (overlay; do not edit generated catalog)
import type { CatalogProduct } from "./types";

const MIN_RICH = 80;

/** PDPs that should title-match ranking queries like “banana mac dime”. */
export const STRAIN_SEO_SLUGS = new Set([
  "key-lime-pie",
  "birthday-cake",
  "king-louis-xiii",
  "sour-grape",
  "blackberry-og",
  "banana-mac",
  "papaya",
  "miami-ice",
  "lime-sherbanger",
  "peach-ice-t",
  "blueberry-lemon-haze",
  "guavalicious",
  "paradise-passion",
]);

/** Strip format suffixes so titles match “{flavor} dime” queries. */
export function productQueryName(name: string): string {
  return name
    .replace(/\s+Live Reserve Vape$/i, "")
    .replace(/\s+Signature Vape$/i, "")
    .replace(/\s+Vape Collaboration$/i, "")
    .replace(/\s+Vape$/i, "")
    .trim();
}

export function isStrainSeoProduct(product: Pick<CatalogProduct, "slug" | "strainType">): boolean {
  return STRAIN_SEO_SLUGS.has(product.slug) && product.strainType !== "na";
}

export function productSeoTitle(product: CatalogProduct): string {
  if (!isStrainSeoProduct(product)) return product.name;
  return `${productQueryName(product.name)} DIME — ${product.lineName ?? "Cart"}`;
}

export function productSeoMetaDescription(
  product: CatalogProduct,
  format: string,
  thcLabel: string
): string {
  if (!isStrainSeoProduct(product)) return product.description;
  const query = productQueryName(product.name);
  return `Shop ${query} DIME ${format} from DIME ${product.lineName ?? "Industries"}. Lab-tested ${thcLabel} THC — licensed markets only.`;
}

function strainPhrase(strain: CatalogProduct["strainType"]): string {
  if (strain === "sativa") return "sativa-leaning";
  if (strain === "indica") return "indica-leaning";
  if (strain === "hybrid") return "hybrid";
  return "DIME";
}

function linePhrase(product: CatalogProduct): string {
  const line = (product.lineName || product.lineSlug || "").toLowerCase();
  if (line.includes("live reserve")) {
    return "DIME Live Reserve — high-terpene extract with melted diamonds on engineered hardware";
  }
  if (line.includes("rosin")) {
    return "DIME Rosin — solventless-style extract on lab-tested DIME hardware";
  }
  if (line.includes("signature")) {
    return "DIME Signature — distillate-forward flagship carts and formats";
  }
  if (line.includes("balanced")) {
    return "DIME Balanced — ratio-minded formats for licensed markets";
  }
  if (line.includes("state")) {
    return "DIME State Exclusive — region-focused flavors on DIME hardware";
  }
  if (line.includes("collab")) {
    return "DIME Collabs — collaborative flavor drops on DIME hardware";
  }
  if (product.categorySlug === "edibles") {
    return "DIME edibles — lab-tested gummies and softgels for licensed markets";
  }
  if (product.categorySlug === "accessories") {
    return "DIME accessories — batteries and hardware designed for DIME carts";
  }
  if (product.categorySlug === "prerolls") {
    return "DIME prerolls — premium flower formats where stocked";
  }
  return "DIME Industries — lab-tested cannabis products for licensed markets";
}

/**
 * If description is thin (name-only), expand with keyword-aware SEO copy.
 * Keeps existing rich copy (bundles, preroll placeholder) untouched.
 */
export function withSeoProductDescription(product: CatalogProduct): CatalogProduct {
  const raw = (product.description || "").trim();
  if (raw.length >= MIN_RICH) return product;

  const format =
    product.variants[0]?.weightOrFormat?.toLowerCase().includes("cartridge")
      ? "dime cart / cartridge"
      : product.variants[0]?.weightOrFormat || "format";

  const effects =
    product.effects.length > 0
      ? ` Common shopper tags: ${product.effects.slice(0, 3).join(", ")}.`
      : "";

  const query = productQueryName(product.name);
  const rankingLead = STRAIN_SEO_SLUGS.has(product.slug)
    ? `Shop ${query} DIME. `
    : "";

  const strainBit =
    product.strainType !== "na"
      ? ` This ${strainPhrase(product.strainType)} option is listed as ${product.name}.`
      : ` ${product.name} is part of the DIME accessories and hardware lineup.`;

  const description = `${rankingLead}${product.name} from ${linePhrase(product)}. Shop this ${format} where licensed online or via Find DIME retailers.${strainBit}${effects} Always confirm the batch on Lab Results and validate authenticity after purchase. Adults 21+ or qualifying patients only — educational product copy, not medical advice.`;

  return { ...product, description };
}

export function withSeoProductDescriptions(
  products: CatalogProduct[]
): CatalogProduct[] {
  return products.map(withSeoProductDescription);
}
