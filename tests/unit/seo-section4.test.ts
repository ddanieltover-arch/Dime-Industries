// tests/unit/seo-section4.test.ts
import { describe, expect, it } from "vitest";
import {
  buildHowToJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildSoftwareApplicationJsonLd,
  buildVideoObjectJsonLd,
  buildWebSiteJsonLd,
  ORGANIZATION_SAME_AS,
  VALIDATE_HOWTO_STEPS,
} from "../../lib/seo/json-ld";
import { SITE_URL } from "../../lib/seo/site";

describe("Section 4 — Organization", () => {
  it("includes logo ImageObject, contactPoint, sameAs, areaServed", () => {
    const json = buildOrganizationJsonLd();
    expect(json["@type"]).toBe("Organization");
    expect(json.url).toBe(SITE_URL);
    expect(json.logo).toMatchObject({
      "@type": "ImageObject",
      url: `${SITE_URL}/brand/logo.png`,
    });
    expect(json.sameAs).toEqual([...ORGANIZATION_SAME_AS]);
    expect(Array.isArray(json.contactPoint)).toBe(true);
    expect(Array.isArray(json.areaServed)).toBe(true);
    expect((json.areaServed as unknown[]).length).toBeGreaterThanOrEqual(9);
  });
});

describe("Section 4 — WebSite SearchAction", () => {
  it("targets shop search with query placeholder", () => {
    const json = buildWebSiteJsonLd();
    expect(json["@type"]).toBe("WebSite");
    const action = json.potentialAction as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
    expect(action["query-input"]).toBe("required name=search_term_string");
    const target = action.target as Record<string, unknown>;
    expect(target.urlTemplate).toBe(`${SITE_URL}/shop?q={search_term_string}`);
  });
});

describe("Section 4 — HowTo / SoftwareApplication / VideoObject", () => {
  it("builds HowTo with ordered steps", () => {
    const json = buildHowToJsonLd({
      name: "How to validate a DIME product",
      description: "Scratch, verify, earn.",
      url: "/validate",
      steps: VALIDATE_HOWTO_STEPS,
    });
    expect(json["@type"]).toBe("HowTo");
    expect(json.url).toBe(`${SITE_URL}/validate`);
    expect(json.step).toHaveLength(4);
    expect((json.step as Record<string, unknown>[])[0]).toMatchObject({
      "@type": "HowToStep",
      position: 1,
      name: "Scratch the code",
    });
  });

  it("builds SoftwareApplication for DIME App", () => {
    const json = buildSoftwareApplicationJsonLd();
    expect(json["@type"]).toBe("SoftwareApplication");
    expect(json.name).toBe("DIME App");
    expect(json.offers).toMatchObject({ price: "0", priceCurrency: "USD" });
  });

  it("builds VideoObject for hero film", () => {
    const json = buildVideoObjectJsonLd();
    expect(json["@type"]).toBe("VideoObject");
    expect(json.contentUrl).toBe(`${SITE_URL}/brand/hero.mp4`);
    expect(json.thumbnailUrl).toBe(`${SITE_URL}/brand/hero-poster.webp`);
  });
});

describe("Section 4 — Product + Review", () => {
  it("builds Product offers and optional reviews", () => {
    const json = buildProductJsonLd({
      name: "Black Ice",
      description: "Live Reserve cart",
      slug: "black-ice",
      sku: "SKU-1",
      priceCents: 4500,
      inStock: true,
      imageUrl: "https://cdn.example/black-ice.webp",
      aggregateRating: { ratingValue: 4.5, reviewCount: 2 },
      reviews: [
        {
          authorName: "Verified buyer",
          rating: 5,
          body: "Great flavor",
          datePublished: "2026-07-01T00:00:00.000Z",
        },
      ],
    });
    expect(json["@type"]).toBe("Product");
    expect(json.brand).toMatchObject({ name: "DIME Industries" });
    expect(json.offers).toMatchObject({
      "@type": "Offer",
      price: "45.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    });
    expect(json.aggregateRating).toMatchObject({ reviewCount: 2 });
    expect(json.review).toHaveLength(1);
  });
});
