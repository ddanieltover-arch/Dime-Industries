// tests/unit/seo-section11.test.ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const seoDir = join(root, "docs", "seo");

describe("Section 11 — Automation / CI artifacts", () => {
  it("ships lighthouse config and SEO workflows", () => {
    expect(existsSync(join(root, ".lighthouserc.json"))).toBe(true);
    expect(existsSync(join(root, ".github/workflows/seo-check.yml"))).toBe(true);
    expect(existsSync(join(root, ".github/workflows/seo-lighthouse-weekly.yml"))).toBe(
      true
    );
    expect(existsSync(join(root, ".github/workflows/seo-crawl-monthly.yml"))).toBe(
      true
    );
  });

  it("ships SEO automation scripts", () => {
    for (const file of [
      "scripts/seo-audit.mjs",
      "scripts/validate-schema.ts",
      "scripts/content-freshness.mjs",
      "scripts/check-internal-links.mjs",
      "scripts/ping-sitemap.mjs",
    ]) {
      expect(existsSync(join(root, file))).toBe(true);
    }
  });

  it("production deploy pings sitemap after smoke", () => {
    const yml = readFileSync(
      join(root, ".github/workflows/deploy-production.yml"),
      "utf8"
    );
    expect(yml).toContain("ping-sitemap");
    expect(yml).toContain("scripts/ping-sitemap.mjs");
  });

  it("documents Section 11 and npm seo:ci entry", () => {
    expect(existsSync(join(seoDir, "section_11_automation.md"))).toBe(true);
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    expect(pkg.scripts["seo:ci"]).toBeTruthy();
    expect(pkg.scripts["seo:audit"]).toBeTruthy();
    expect(pkg.scripts["seo:schema"]).toBeTruthy();
  });

  it("lighthouse asserts SEO category as error", () => {
    const cfg = JSON.parse(readFileSync(join(root, ".lighthouserc.json"), "utf8"));
    expect(cfg.ci.assert.assertions["categories:seo"][0]).toBe("error");
  });
});
