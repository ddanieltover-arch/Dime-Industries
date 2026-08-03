// tests/unit/seo-section12.test.ts
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const seoDir = join(process.cwd(), "docs", "seo");
const root = process.cwd();

const REQUIRED_FILES = [
  "audit_report.json",
  "crawl_inventory.csv",
  "core_web_vitals_baseline.json",
  "keyword_map.csv",
  "competitor_report.csv",
  "seo_strategy.md",
  "internal_linking_plan.csv",
  "content_calendar.csv",
  "schema_validation_report.json",
  "link_gap_opportunities.csv",
  "link_building_crm.csv",
  "guest_post_pipeline.csv",
  "email_templates.md",
  "analytics_setup.md",
  "kpis_dashboard.md",
  "geo_content_briefs.md",
  "disavow.txt",
  "section_12_deliverables.md",
] as const;

describe("Section 12 — Deliverables checklist", () => {
  it("ships every master-prompt file deliverable (docs paths)", () => {
    for (const file of REQUIRED_FILES) {
      expect(existsSync(join(seoDir, file)), file).toBe(true);
    }
  });

  it("ships llms.txt at site root public/", () => {
    expect(existsSync(join(root, "public/llms.txt"))).toBe(true);
    const body = readFileSync(join(root, "public/llms.txt"), "utf8");
    expect(body).toMatch(/DIME Industries/i);
  });

  it("ships content_briefs directory with multiple briefs", () => {
    const dir = join(seoDir, "content_briefs");
    expect(existsSync(dir)).toBe(true);
    const names = readdirSync(dir).filter((f) => f.endsWith(".md"));
    expect(names.length).toBeGreaterThanOrEqual(8);
  });

  it("schema validation report records builder pass + owner Rich Results", () => {
    const report = JSON.parse(
      readFileSync(join(seoDir, "schema_validation_report.json"), "utf8")
    );
    expect(report.builderValidation.passed).toBe(true);
    expect(report.richResultsTest.status).toBe("owner_action_required");
    expect(report.primaryUrlsToTest.length).toBeGreaterThanOrEqual(5);
  });

  it("CRM is seeded with ≥50 prospects", () => {
    const rows = readFileSync(join(seoDir, "link_building_crm.csv"), "utf8")
      .trim()
      .split(/\r?\n/);
    expect(rows.length - 1).toBeGreaterThanOrEqual(50);
  });

  it("documents robots and sitemap as dynamic live surfaces", () => {
    expect(existsSync(join(seoDir, "robots.txt.md"))).toBe(true);
    expect(existsSync(join(seoDir, "sitemap.md"))).toBe(true);
    expect(existsSync(join(root, "app/robots.ts"))).toBe(true);
    expect(existsSync(join(root, "app/sitemap.ts"))).toBe(true);
  });

  it("section 12 checklist marks program sections 0–11", () => {
    const body = readFileSync(join(seoDir, "section_12_deliverables.md"), "utf8");
    expect(body).toMatch(/Section 12/);
    expect(body).toMatch(/Owner action queue/);
    for (const n of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11]) {
      expect(body).toContain(String(n));
    }
  });
});
