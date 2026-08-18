// tests/unit/keyword-gap-posts.test.ts
import { describe, expect, it } from "vitest";
import { KEYWORD_GAP_POSTS_2026 } from "../../lib/cms/posts/keyword-gap-posts-2026";
import { DEFAULT_POSTS } from "../../lib/cms/store";
import {
  productQueryName,
  productSeoTitle,
  STRAIN_SEO_SLUGS,
} from "../../lib/catalog/seo-copy";
import { SEO_BLOG_SLUGS } from "../../lib/seo/site";
import { catalogSeoLinks } from "../../lib/seo/related-posts";

const GAP_SLUGS = [
  "signature-vs-balanced",
  "dime-vape-heat-settings",
  "dime-disposable-vapes",
  "dime-gummies",
  "find-dime-new-york",
] as const;

describe("Keyword-gap posts (GSC / Ahrefs URLs)", () => {
  it("publishes dedicated posts for ranking queries that lacked a URL", () => {
    expect(KEYWORD_GAP_POSTS_2026.map((p) => p.slug)).toEqual([...GAP_SLUGS]);
    for (const slug of GAP_SLUGS) {
      const post = DEFAULT_POSTS.find((p) => p.slug === slug);
      expect(post, slug).toBeTruthy();
      expect(post!.status).toBe("published");
      expect(post!.body.startsWith("Quick Answer:")).toBe(true);
      expect(SEO_BLOG_SLUGS).toContain(slug);
    }
  });

  it("titles ranking SKUs as “{flavor} DIME”", () => {
    expect(productQueryName("Banana Mac Live Reserve Vape")).toBe("Banana Mac");
    expect(productQueryName("Guavalicious Signature Vape")).toBe("Guavalicious");
    expect(productQueryName("Peach Ice-T Vape Collaboration")).toBe("Peach Ice-T");
    expect(productQueryName("Paradise Passion Vape")).toBe("Paradise Passion");

    for (const slug of [
      "banana-mac",
      "papaya",
      "miami-ice",
      "lime-sherbanger",
      "peach-ice-t",
      "blueberry-lemon-haze",
      "guavalicious",
      "paradise-passion",
    ]) {
      expect(STRAIN_SEO_SLUGS.has(slug)).toBe(true);
    }

    expect(
      productSeoTitle({
        id: "p-banana-mac",
        slug: "banana-mac",
        name: "Banana Mac Live Reserve Vape",
        description: "Banana Mac",
        categorySlug: "vapes",
        categoryName: "Vapes",
        lineSlug: "live-reserve",
        lineName: "Live Reserve",
        strainType: "hybrid",
        status: "active",
        allowedJurisdictions: ["CA"],
        effects: [],
        coaUrl: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        popularityScore: 1,
        imageUrl: null,
        galleryUrls: [],
        brandPath: null,
        variants: [],
      })
    ).toBe("Banana Mac DIME — Live Reserve");
  });

  it("links ranking SKUs from Signature and Live Reserve hubs", () => {
    const signature = catalogSeoLinks("/shop/vapes/signature");
    expect(signature.some((l) => l.href === "/product/lime-sherbanger")).toBe(true);
    expect(signature.some((l) => l.href === "/blog/signature-vs-balanced")).toBe(true);

    const live = catalogSeoLinks("/shop/vapes/live-reserve");
    expect(live.some((l) => l.href === "/product/banana-mac")).toBe(true);

    const edibles = catalogSeoLinks("/shop/edibles");
    expect(edibles.some((l) => l.href === "/blog/dime-gummies")).toBe(true);
  });
});
