import { describe, it, expect } from "vitest";
import {
  BUNDLE_DEFS,
  materializeBundles,
  bundleCompareAtCents,
  isBundleProduct,
} from "../../lib/catalog/bundles";
import { SEED_CATALOG, listProducts, getProductBySlug } from "../../lib/catalog";

describe("product bundles", () => {
  const base = SEED_CATALOG.filter((p) => p.categorySlug !== "bundles");

  it("materializes all defs whose components exist", () => {
    const bundles = materializeBundles(base);
    expect(bundles.length).toBe(BUNDLE_DEFS.length);
    expect(bundles.every((b) => b.categorySlug === "bundles")).toBe(true);
    expect(bundles.every((b) => isBundleProduct(b))).toBe(true);
  });

  it("prices the Signature Five Pack at the promo amount under compare-at", () => {
    const bundle = materializeBundles(base).find((b) => b.slug === "signature-five-pack");
    expect(bundle).toBeTruthy();
    const price = bundle!.variants[0]!.retailPriceCents;
    const compare = bundle!.compareAtPriceCents ?? 0;
    expect(price).toBe(11000);
    expect(compare).toBeGreaterThan(price);
  });

  it("exposes bundles in the seed catalog and shop category", () => {
    expect(getProductBySlug("live-reserve-trio")).not.toBeNull();
    const listed = listProducts({ category: "bundles", jurisdiction: "CA" });
    expect(listed.total).toBeGreaterThanOrEqual(3);
    expect(listed.items.every((i) => i.isBundle)).toBe(true);
  });

  it("computes compare-at from component retail", () => {
    const def = BUNDLE_DEFS[0]!;
    const compare = bundleCompareAtCents(base, def.components);
    expect(compare).toBeGreaterThan(0);
  });
});
