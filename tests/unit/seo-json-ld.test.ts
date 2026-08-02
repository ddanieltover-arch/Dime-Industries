// tests/unit/seo-json-ld.test.ts
import { describe, expect, it } from "vitest";
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildWebSiteJsonLd,
} from "../../lib/seo/json-ld";
import { SITE_URL } from "../../lib/seo/site";

describe("SEO JSON-LD builders", () => {
  it("builds BlogPosting with absolute URLs", () => {
    const json = buildBlogPostingJsonLd({
      title: "How many dimes in a roll?",
      excerpt: "40 dimes / $4",
      slug: "how-many-dimes-in-a-roll",
      publishedAt: "2026-08-02T00:00:00.000Z",
      updatedAt: "2026-08-02T00:00:00.000Z",
    });
    expect(json["@type"]).toBe("BlogPosting");
    expect(json.url).toBe(`${SITE_URL}/blog/how-many-dimes-in-a-roll`);
    expect(json.headline).toBe("How many dimes in a roll?");
  });

  it("builds BreadcrumbList positions", () => {
    const json = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ]);
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toHaveLength(2);
    expect(json.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Home",
      item: SITE_URL,
    });
  });

  it("builds WebSite schema", () => {
    const json = buildWebSiteJsonLd();
    expect(json["@type"]).toBe("WebSite");
    expect(json.url).toBe(SITE_URL);
    expect(json.name).toBe("DIME Industries");
  });
});
