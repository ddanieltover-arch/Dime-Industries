// lib/catalog/bundles.ts
// Product bundles materialize as CatalogProduct rows (category "bundles") so
// cart/ATC/checkout stay variant-based with no schema change. Components are
// display + stock-derivation metadata only.

import type { CatalogProduct, CatalogVariant } from "./types";

export type BundleComponentDef = {
  productSlug: string;
  quantity: number;
};

export type BundleDef = {
  id: string;
  slug: string;
  name: string;
  description: string;
  components: BundleComponentDef[];
  /** Override package price; default = 85% of component retail sum */
  bundlePriceCents?: number;
  /** Component slug whose image becomes the bundle hero */
  imageFromSlug?: string;
  popularityScore: number;
  effects?: string[];
};

function cheapestVariant(product: CatalogProduct): CatalogVariant {
  return [...product.variants].sort((a, b) => a.retailPriceCents - b.retailPriceCents)[0]!;
}

export const BUNDLE_DEFS: BundleDef[] = [
  {
    id: "p-bundle-live-reserve-trio",
    slug: "live-reserve-trio",
    name: "Live Reserve Trio",
    description:
      "Three Live Reserve carts in one package — Miami Ice, Kushmint, and Pink Rose. Elevate your experience with a curated award-winning set at a bundle price.",
    components: [
      { productSlug: "miami-ice", quantity: 1 },
      { productSlug: "kushmint", quantity: 1 },
      { productSlug: "pink-rose", quantity: 1 },
    ],
    imageFromSlug: "miami-ice",
    popularityScore: 96,
    effects: ["balanced", "euphoric", "curated"],
  },
  {
    id: "p-bundle-signature-five",
    slug: "signature-five-pack",
    name: "Signature Five Pack",
    description:
      "Five Signature vapes for one checkout — Mango Diesel, Watermelon Kush, Pink Rose, Sour Tangie, and Banana Punch. Shop now and save versus buying each cart alone.",
    components: [
      { productSlug: "mango-diesel", quantity: 1 },
      { productSlug: "watermelon-kush", quantity: 1 },
      { productSlug: "pink-rose", quantity: 1 },
      { productSlug: "sour-tangie", quantity: 1 },
      { productSlug: "banana-punch", quantity: 1 },
    ],
    // Marketing "5 for $110" style offer when components would retail higher
    bundlePriceCents: 11000,
    imageFromSlug: "mango-diesel",
    popularityScore: 94,
    effects: ["variety", "value", "signature"],
  },
  {
    id: "p-bundle-edibles-duo",
    slug: "peach-edibles-duo",
    name: "Peach Edibles Duo",
    description:
      "Peach Softgels and Peach Ice T gummies together — a flavor-matched edibles pair with bundle savings.",
    components: [
      { productSlug: "peach", quantity: 1 },
      { productSlug: "peach-ice-t", quantity: 1 },
    ],
    imageFromSlug: "peach-ice-t",
    popularityScore: 88,
    effects: ["relaxed", "flavor"],
  },
];

function findProduct(source: CatalogProduct[], slug: string): CatalogProduct | undefined {
  return source.find((p) => p.slug === slug && p.status === "active");
}

/** Sum of component unit prices × quantities (compare-at / savings baseline). */
export function bundleCompareAtCents(
  source: CatalogProduct[],
  components: BundleComponentDef[]
): number {
  let sum = 0;
  for (const c of components) {
    const p = findProduct(source, c.productSlug);
    if (!p) return 0;
    sum += cheapestVariant(p).retailPriceCents * c.quantity;
  }
  return sum;
}

/** Bundle sellable units limited by the scarcest included SKU. */
export function bundleQuantityOnHand(
  source: CatalogProduct[],
  components: BundleComponentDef[]
): number {
  let max = Number.POSITIVE_INFINITY;
  for (const c of components) {
    const p = findProduct(source, c.productSlug);
    if (!p || c.quantity < 1) return 0;
    const stock = p.variants.reduce((s, v) => s + Math.max(0, v.quantityOnHand), 0);
    max = Math.min(max, Math.floor(stock / c.quantity));
  }
  return Number.isFinite(max) ? Math.max(0, max) : 0;
}

export function materializeBundles(source: CatalogProduct[]): CatalogProduct[] {
  const bySlug = new Map(source.map((p) => [p.slug, p]));
  const out: CatalogProduct[] = [];

  for (const def of BUNDLE_DEFS) {
    const resolved = def.components.map((c) => ({
      ...c,
      product: bySlug.get(c.productSlug),
    }));
    if (resolved.some((c) => !c.product)) continue;

    const compareAt = bundleCompareAtCents(source, def.components);
    if (compareAt <= 0) continue;

    const price =
      def.bundlePriceCents != null && def.bundlePriceCents > 0
        ? Math.min(def.bundlePriceCents, compareAt)
        : Math.round(compareAt * 0.85);

    const imageProduct =
      bySlug.get(def.imageFromSlug ?? def.components[0]!.productSlug) ??
      resolved[0]!.product!;

    const thcAvg =
      resolved.reduce((s, c) => s + cheapestVariant(c.product!).thcPct * c.quantity, 0) /
      resolved.reduce((s, c) => s + c.quantity, 0);
    const cbdAvg =
      resolved.reduce((s, c) => s + cheapestVariant(c.product!).cbdPct * c.quantity, 0) /
      resolved.reduce((s, c) => s + c.quantity, 0);

    const jurisdictions = resolved
      .map((c) => new Set(c.product!.allowedJurisdictions))
      .reduce<string[] | null>((acc, set) => {
        if (acc == null) return [...set];
        return acc.filter((j) => set.has(j));
      }, null);

    out.push({
      id: def.id,
      slug: def.slug,
      name: def.name,
      description: def.description,
      categorySlug: "bundles",
      categoryName: "Bundles",
      lineSlug: "bundles",
      lineName: "Bundles",
      strainType: "hybrid",
      status: "active",
      allowedJurisdictions: jurisdictions?.length ? jurisdictions : ["CA", "MA"],
      effects: def.effects ?? ["curated"],
      coaUrl: null,
      createdAt: "2026-08-01T00:00:00.000Z",
      popularityScore: def.popularityScore,
      imageUrl: imageProduct.imageUrl,
      galleryUrls:
        imageProduct.galleryUrls.length > 0
          ? imageProduct.galleryUrls
          : imageProduct.imageUrl
            ? [imageProduct.imageUrl]
            : [],
      brandPath: null,
      bundleComponents: def.components,
      compareAtPriceCents: compareAt,
      variants: [
        {
          id: `v-${def.slug}`,
          sku: `BUNDLE_${def.slug.replace(/-/g, "_").toUpperCase()}`,
          weightOrFormat: `${def.components.reduce((s, c) => s + c.quantity, 0)}-item bundle`,
          retailPriceCents: price,
          thcPct: Math.round(thcAvg * 10) / 10,
          cbdPct: Math.round(cbdAvg * 10) / 10,
          cbnPct: null,
          quantityOnHand: bundleQuantityOnHand(source, def.components),
        },
      ],
    });
  }

  return out;
}

export function isBundleProduct(product: CatalogProduct): boolean {
  return Boolean(product.bundleComponents?.length);
}
