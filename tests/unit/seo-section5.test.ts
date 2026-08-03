// tests/unit/seo-section5.test.ts
import { describe, expect, it } from "vitest";
import { renderCmsBody } from "../../lib/cms/render";
import { DEFAULT_POSTS } from "../../lib/cms/store";
import {
  BRAND_FACTS,
  GEO_PAA_QUESTIONS,
  GLOSSARY_TERMS,
} from "../../lib/seo/geo-content";
import { SEO_BLOG_SLUGS, SEO_STATIC_PATHS } from "../../lib/seo/site";

describe("Section 5 — GEO surfaces", () => {
  it("ships glossary, trust, and facts in static SEO paths", () => {
    expect(SEO_STATIC_PATHS).toEqual(
      expect.arrayContaining(["/glossary", "/trust", "/facts"])
    );
  });

  it("defines glossary terms with 100+ character definitions", () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(8);
    for (const term of GLOSSARY_TERMS) {
      expect(term.definition.length).toBeGreaterThanOrEqual(100);
      expect(term.id).toBeTruthy();
    }
  });

  it("lists citable brand facts with on-site sources", () => {
    expect(BRAND_FACTS.length).toBeGreaterThanOrEqual(5);
    for (const fact of BRAND_FACTS) {
      expect(fact.citationHref.startsWith("/")).toBe(true);
    }
  });

  it("includes how-to-use cart post with Quick Answer + table", () => {
    expect(SEO_BLOG_SLUGS).toContain("how-to-use-a-dime-cart");
    const post = DEFAULT_POSTS.find((p) => p.slug === "how-to-use-a-dime-cart");
    expect(post?.body.startsWith("Quick Answer:")).toBe(true);
    const blocks = renderCmsBody(post!.body);
    expect(blocks.some((b) => b.type === "table")).toBe(true);
  });

  it("parses GFM tables in CMS bodies", () => {
    const blocks = renderCmsBody(`### Title

| A | B |
| --- | --- |
| 1 | 2 |

Next paragraph.`);
    expect(blocks.some((b) => b.type === "table")).toBe(true);
    const table = blocks.find((b) => b.type === "table");
    expect(table).toMatchObject({
      type: "table",
      headers: ["A", "B"],
      rows: [["1", "2"]],
    });
  });

  it("keeps conversational PAA list for FAQ hub", () => {
    expect(GEO_PAA_QUESTIONS.length).toBeGreaterThanOrEqual(8);
  });
});
