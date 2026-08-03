// tests/unit/seo-section9.test.ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const seoDir = join(process.cwd(), "docs", "seo");

function csvRows(name: string): string[] {
  return readFileSync(join(seoDir, name), "utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
}

describe("Section 9 — Link building / PR artifacts", () => {
  it("ships core Section 9 documents", () => {
    for (const file of [
      "section_9_link_building.md",
      "backlink_audit.md",
      "link_quality_standards.md",
      "outreach_infrastructure.md",
      "email_templates.md",
      "digital_pr_quarterly.md",
      "disavow.txt",
      "link_gap_opportunities.csv",
      "link_building_crm.csv",
      "guest_post_pipeline.csv",
      "backlink_top20_template.csv",
    ]) {
      expect(existsSync(join(seoDir, file))).toBe(true);
    }
  });

  it("seeds CRM with at least 50 prospects and required columns", () => {
    const rows = csvRows("link_building_crm.csv");
    expect(rows[0]).toContain("Prospect Domain");
    expect(rows[0]).toContain("Link Acquired (Y/N)");
    expect(rows[0]).toContain("Tier");
    expect(rows.length - 1).toBeGreaterThanOrEqual(50);
  });

  it("includes competitor-informed link gap opportunities", () => {
    const body = readFileSync(join(seoDir, "link_gap_opportunities.csv"), "utf8");
    expect(body).toMatch(/Opportunity Type/);
    expect(body).toMatch(/halaracannabis\.com|binske\.com/);
    expect(body).toMatch(/mjbizdaily\.com|weedmaps\.com/);
    expect(body.split(/\r?\n/).length).toBeGreaterThan(20);
  });

  it("covers all seven outreach tiers in email templates", () => {
    const body = readFileSync(join(seoDir, "email_templates.md"), "utf8");
    for (const tier of [
      "Tier 1",
      "Tier 2",
      "Tier 3",
      "Tier 4",
      "Tier 5",
      "Tier 6",
      "Tier 7",
    ]) {
      expect(body).toContain(tier);
    }
  });

  it("keeps disavow file as a commented placeholder until Ahrefs review", () => {
    const body = readFileSync(join(seoDir, "disavow.txt"), "utf8");
    expect(body).toMatch(/EMPTY|no toxic domains confirmed/i);
    expect(body).not.toMatch(/^domain:[a-z0-9.-]+$/m);
  });

  it("documents quality bar DR ≥ 30 and traffic > 100", () => {
    const body = readFileSync(join(seoDir, "link_quality_standards.md"), "utf8");
    expect(body).toMatch(/≥ 30|>= 30/);
    expect(body).toMatch(/> 100/);
  });
});
