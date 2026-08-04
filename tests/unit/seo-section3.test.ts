// tests/unit/seo-section3.test.ts
import { describe, expect, it } from "vitest";
import { DEFAULT_HOMEPAGE_LAYOUT } from "../../lib/cms/homepage-layout";
import { DEFAULT_POSTS } from "../../lib/cms/store";
import {
  blogSidebarLinks,
  catalogSeoLinks,
  pickRelatedPosts,
} from "../../lib/seo/related-posts";

describe("Section 3 — H1 defaults", () => {
  it("homepage hero uses brand keyword H1", () => {
    const hero = DEFAULT_HOMEPAGE_LAYOUT.sections.find((s) => s.id === "hero");
    expect(hero?.headline).toBe("DIME Industries");
    expect(hero?.ctaHref).toBe("/shop/vapes");
  });
});

describe("Section 3 — dime roll factual fix", () => {
  it("states 50 dimes / $5 in capsule and excerpt", () => {
    const post = DEFAULT_POSTS.find((p) => p.slug === "how-many-dimes-in-a-roll");
    expect(post).toBeTruthy();
    expect(post!.excerpt).toMatch(/50 dimes/);
    expect(post!.excerpt).toMatch(/\$5/);
    expect(post!.body).toMatch(/Quick Answer:.*50 dimes.*\$5\.00/s);
    expect(post!.body).not.toMatch(/40 dimes/);
  });
});

describe("Section 3 — answer capsules", () => {
  it("every default published post opens with Quick Answer", () => {
    for (const post of DEFAULT_POSTS) {
      if (post.status !== "published") continue;
      expect(post.body.startsWith("Quick Answer:"), post.slug).toBe(true);
    }
  });
});

describe("Section 3 — internal linking helpers", () => {
  it("picks cluster siblings before recency fallback", () => {
    const all = DEFAULT_POSTS.map((p) => ({ slug: p.slug, title: p.title }));
    const related = pickRelatedPosts("what-is-a-dime-cart", all, 3);
    expect(related.map((p) => p.slug)).toEqual([
      "dime-cart-vs-disposable",
      "how-to-use-a-dime-cart",
      "how-to-spot-fake-dime-carts",
    ]);
  });

  it("returns pillar CTAs for Live Reserve posts", () => {
    const links = blogSidebarLinks("dime-live-reserve-explained");
    expect(links[0]?.href).toBe("/shop/vapes/live-reserve");
  });

  it("exposes catalog SEO links for vapes hub", () => {
    const links = catalogSeoLinks("/shop/vapes");
    expect(links.some((l) => l.href === "/blog/what-is-a-dime-cart")).toBe(true);
    expect(links.some((l) => l.href === "/blog/beginners-guide-to-dime-carts")).toBe(true);
    expect(links.some((l) => l.href === "/blog/best-dime-industries-flavors")).toBe(true);
    expect(links.some((l) => l.href === "/shop/vapes/disposables")).toBe(true);
  });

  it("exposes prerolls soft-hub SEO links", () => {
    const links = catalogSeoLinks("/shop/prerolls");
    expect(links.some((l) => l.href === "/blog/dime-prerolls-buying-guide")).toBe(true);
  });
});
