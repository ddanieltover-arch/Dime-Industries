// tests/unit/seo-linking-copy.test.ts
import { describe, expect, it } from "vitest";
import { SEED_CATALOG } from "../../lib/catalog/seed-catalog";
import { withSeoProductDescription } from "../../lib/catalog/seo-copy";
import { isExternalHref, parseCmsInline } from "../../lib/cms/render";
import { outboundCitationsFor } from "../../lib/seo/outbound-citations";
import { productSeoInternalLinks } from "../../lib/seo/product-internal-links";
import { catalogSeoLinks } from "../../lib/seo/related-posts";
import { SEO_STATIC_PATHS } from "../../lib/seo/site";

describe("CMS inline links", () => {
  it("parses absolute https links as external", () => {
    const parts = parseCmsInline(
      "See the [California DCC](https://cannabis.ca.gov/) and [shop](/shop/vapes)."
    );
    expect(parts).toEqual([
      { type: "text", text: "See the " },
      { type: "link", text: "California DCC", href: "https://cannabis.ca.gov/" },
      { type: "text", text: " and " },
      { type: "link", text: "shop", href: "/shop/vapes" },
      { type: "text", text: "." },
    ]);
    expect(isExternalHref("https://cannabis.ca.gov/")).toBe(true);
    expect(isExternalHref("/shop/vapes")).toBe(false);
  });
});

describe("Outbound citations", () => {
  it("returns 2–3 citations for blog and catalog inbound pages", () => {
    const blog = outboundCitationsFor("what-is-a-dime-cart");
    expect(blog.length).toBeGreaterThanOrEqual(2);
    expect(blog.length).toBeLessThanOrEqual(3);
    expect(blog.every((c) => c.href.startsWith("https://"))).toBe(true);

    const hub = outboundCitationsFor("/shop/vapes");
    expect(hub.length).toBeGreaterThanOrEqual(2);

    const product = outboundCitationsFor("product:key-lime-pie");
    expect(product.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Keyword internal links", () => {
  it("exposes disposables SEO landing on vapes hub", () => {
    const links = catalogSeoLinks("/shop/vapes");
    expect(links.some((l) => l.href === "/shop/vapes/disposables")).toBe(true);
    expect(SEO_STATIC_PATHS).toContain("/shop/vapes/disposables");
  });

  it("builds PDP SEO internal links by line", () => {
    const live = productSeoInternalLinks({
      slug: "king-louis-xiii",
      lineSlug: "live-reserve",
      categorySlug: "vapes",
    });
    expect(live.some((l) => l.href === "/shop/vapes/live-reserve")).toBe(true);
    expect(live.some((l) => l.href === "/blog/what-is-a-dime-cart")).toBe(true);
  });
});

describe("SEO product descriptions", () => {
  it("expands thin name-only descriptions", () => {
    const thin = withSeoProductDescription({
      id: "p-test",
      slug: "key-lime-pie",
      name: "Key Lime Pie",
      description: "Key Lime Pie",
      categorySlug: "vapes",
      categoryName: "Vapes",
      lineSlug: "signature",
      lineName: "Signature",
      strainType: "hybrid",
      status: "active",
      allowedJurisdictions: ["CA"],
      effects: ["euphoric"],
      coaUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      popularityScore: 1,
      imageUrl: null,
      galleryUrls: [],
      brandPath: null,
      variants: [
        {
          id: "v-test",
          sku: "TEST",
          weightOrFormat: "1g cartridge",
          retailPriceCents: 4000,
          thcPct: 80,
          cbdPct: 0,
          cbnPct: null,
          quantityOnHand: 10,
        },
      ],
    });
    expect(thin.description.length).toBeGreaterThan(80);
    expect(thin.description.toLowerCase()).toMatch(/dime cart|cartridge/);
    expect(thin.description).toMatch(/Key Lime Pie/);
  });

  it("applies SEO overlays across the seed catalog for thin SKUs", () => {
    const thinCount = SEED_CATALOG.filter(
      (p) =>
        !p.slug.startsWith("bundle-") &&
        (p.description || "").trim().length < 80
    ).length;
    expect(thinCount).toBe(0);
  });
});
