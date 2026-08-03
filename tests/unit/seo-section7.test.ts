// tests/unit/seo-section7.test.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const seoDir = join(process.cwd(), "docs", "seo");

function readCsv(name: string): string[][] {
  const raw = readFileSync(join(seoDir, name), "utf8").trim();
  return raw.split(/\r?\n/).map((line) => line.split(","));
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

  it("ships 90-day calendar with required columns and cadence", () => {
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
    const planned = rows.slice(1).filter((r) => r[6] === "Planned");
    expect(planned.length).toBeGreaterThanOrEqual(20);
    const info = planned.filter((r) =>
      String(r[4]).toLowerCase().startsWith("informational")
    ).length;
    expect(info / planned.length).toBeGreaterThan(0.45);
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
});
