// tests/unit/seo-section2.test.ts
import { describe, expect, it } from "vitest";
import { excerptFromCmsBody, buildCmsPageMetadata } from "../../lib/seo/cms-meta";
import {
  catalogRobotsForFilters,
  isCatalogUrlIndexable,
} from "../../lib/seo/catalog-indexability";
import { SECURITY_HEADERS } from "../../lib/security/headers";

describe("CMS meta helpers", () => {
  it("excerpts body text for descriptions", () => {
    const body = "### Heading\n\nHello world from DIME Industries with more words here.";
    expect(excerptFromCmsBody(body, 40)).toMatch(/Hello world/);
    expect(excerptFromCmsBody(body, 40).length).toBeLessThanOrEqual(40);
  });

  it("builds OG + canonical metadata", () => {
    const meta = buildCmsPageMetadata({
      title: "About",
      body: "DIME Industries is a licensed cannabis brand founded in 2016.",
      path: "/about",
    });
    expect(meta.title).toBe("About");
    expect(meta.description).toContain("licensed cannabis");
    expect(meta.alternates).toEqual({ canonical: "/about" });
    expect(meta.openGraph?.title).toBe("About");
  });
});

describe("catalog indexability", () => {
  it("indexes clean category paths", () => {
    expect(
      isCatalogUrlIndexable({ sort: "popularity", page: 1, pageSize: 24 }, "/shop/vapes")
    ).toBe(true);
    expect(catalogRobotsForFilters({ sort: "popularity", page: 1 }, "/shop").index).toBe(true);
  });

  it("noindexes facet and pagination duplicates", () => {
    expect(isCatalogUrlIndexable({ strain: "hybrid", page: 1 }, "/shop/vapes")).toBe(false);
    expect(isCatalogUrlIndexable({ q: "peach", page: 1 }, "/shop")).toBe(false);
    expect(isCatalogUrlIndexable({ page: 2, sort: "popularity" }, "/shop")).toBe(false);
    expect(isCatalogUrlIndexable({ sort: "price-asc", page: 1 }, "/shop")).toBe(false);
    expect(catalogRobotsForFilters({ potency: "high", page: 1 }, "/shop/vapes")).toEqual({
      index: false,
      follow: true,
    });
  });
});

describe("security headers Section 2", () => {
  it("includes HSTS", () => {
    const keys = SECURITY_HEADERS.map((h) => h.key);
    expect(keys).toContain("Strict-Transport-Security");
  });
});

describe("canonical host", () => {
  it("SITE_URL and metadataBase prefer www", async () => {
    const { SITE_URL, absoluteUrl } = await import("../../lib/seo/site");
    expect(SITE_URL).toBe("https://www.dimeindustries.us");
    expect(absoluteUrl("/blog/how-many-dimes-in-a-roll")).toBe(
      "https://www.dimeindustries.us/blog/how-many-dimes-in-a-roll"
    );
    expect(absoluteUrl("/")).toBe("https://www.dimeindustries.us");
  });
});

describe("dime-roll factual claim", () => {
  it("seed post states 50 dimes / $5 and never 40 / $4", async () => {
    const { DEFAULT_POSTS } = await import("../../lib/cms/store");
    const post = DEFAULT_POSTS.find((p) => p.slug === "how-many-dimes-in-a-roll");
    expect(post).toBeTruthy();
    expect(post!.excerpt).toMatch(/50 dimes/);
    expect(post!.excerpt).toMatch(/\$5/);
    expect(post!.body).toMatch(/Quick Answer:.*50 dimes.*\$5\.00/s);
    expect(post!.body).not.toMatch(/40 dimes/);
    expect(post!.body).not.toMatch(/\$4\.00 in face value/);
  });
});
