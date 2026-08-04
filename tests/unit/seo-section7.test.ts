// tests/unit/seo-section7.test.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CALENDAR_POSTS_2026 } from "../../lib/cms/calendar-posts-2026";
import { DEFAULT_POSTS } from "../../lib/cms/store";
import { SEO_BLOG_SLUGS } from "../../lib/seo/site";

const seoDir = join(process.cwd(), "docs", "seo");

function readCsv(name: string): string[][] {
  const raw = readFileSync(join(seoDir, name), "utf8").trim();
  return raw.split(/\r?\n/).map((line) => {
    const cols: string[] = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') {
        q = !q;
        cur += ch;
      } else if (ch === "," && !q) {
        cols.push(cur);
        cur = "";
      } else cur += ch;
    }
    cols.push(cur);
    return cols;
  });
}

describe("Section 7 — Content pipeline artifacts", () => {
  it("ships content audit with disposition flags", () => {
    const rows = readCsv("content_audit.csv");
    expect(rows[0]?.[4]).toBe("Disposition");
    expect(rows.length).toBeGreaterThan(20);
    const dispositions = new Set(rows.slice(1).map((r) => r[4]));
    expect(dispositions.has("Keep as-is") || dispositions.has("Improve")).toBe(
      true
    );
    expect(dispositions.has("Redirect")).toBe(false);
  });

  it("ships 90-day calendar with required columns", () => {
    const rows = readCsv("content_calendar_90d.csv");
    expect(rows[0]?.slice(0, 7)).toEqual([
      "Publish Date",
      "Content Title",
      "Content Type",
      "Primary Keyword",
      "Intent",
      "Word Count Target",
      "Status",
    ]);
    const published = rows.slice(1).filter((r) => r[6] === "Published");
    expect(published.length).toBeGreaterThanOrEqual(30);
  });

  it("includes priority briefs for the next calendar publishes", () => {
    const briefs = [
      "best-dime-industries-flavors.md",
      "live-resin-vs-live-rosin.md",
      "how-to-charge-a-dime-battery.md",
      "beginners-guide-to-dime-carts.md",
      "are-dime-carts-worth-it.md",
      "why-is-my-dime-cart-clogged.md",
      "what-is-in-a-dime-cartridge.md",
    ];
    for (const file of briefs) {
      const body = readFileSync(
        join(seoDir, "content_briefs", file),
        "utf8"
      );
      expect(body).toMatch(/Quick Answer:/);
      expect(body).toMatch(/PRIMARY KEYWORD:/i);
      expect(body).toMatch(/Suggested H2s/i);
    }
  });

  it("publishes calendar posts into DEFAULT_POSTS + SEO_BLOG_SLUGS", () => {
    expect(CALENDAR_POSTS_2026.length).toBe(27);
    for (const post of CALENDAR_POSTS_2026) {
      expect(post.status).toBe("published");
      expect(post.body.startsWith("Quick Answer:")).toBe(true);
      expect(DEFAULT_POSTS.some((p) => p.slug === post.slug)).toBe(true);
      expect(SEO_BLOG_SLUGS).toContain(post.slug);
    }
  });

  it("ships a long-form beginners pillar (~3k+ words)", async () => {
    const { BEGINNERS_GUIDE_PILLAR } = await import(
      "../../lib/cms/posts/beginners-guide-to-dime-carts"
    );
    const words = BEGINNERS_GUIDE_PILLAR.body.trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(2950);
    const live = DEFAULT_POSTS.find((p) => p.slug === "beginners-guide-to-dime-carts");
    expect(live?.updatedAt).toBe(BEGINNERS_GUIDE_PILLAR.updatedAt);
    expect(live?.body).toBe(BEGINNERS_GUIDE_PILLAR.body);
  });

  it("marks quarterly refresh + retrospective calendar rows published", () => {
    const rows = readCsv("content_calendar_90d.csv");
    const quarterly = rows.find((r) => String(r[1]).includes("Quarterly content refresh"));
    const retro = rows.find((r) => String(r[1]).includes("90-day retrospective"));
    expect(quarterly?.[6]).toBe("Published");
    expect(retro?.[6]).toBe("Published");
  });
});
