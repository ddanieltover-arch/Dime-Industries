// tests/unit/seo-section8.test.ts
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  GA_CONVERSION_EVENTS,
  GA_EVENTS_NOT_APPLICABLE,
  GA_MEASUREMENT_ID,
} from "../../lib/analytics/ga";

const seoDir = join(process.cwd(), "docs", "seo");

describe("Section 8 — Analytics / monitoring", () => {
  it("ships a default GA4 measurement ID", () => {
    expect(GA_MEASUREMENT_ID).toMatch(/^G-[A-Z0-9]+$/);
  });

  it("defines required conversion events and marks booking N/A", () => {
    for (const name of [
      "generate_lead",
      "purchase",
      "begin_checkout",
      "sign_up",
      "click",
      "add_to_cart",
      "view_item",
    ]) {
      expect(GA_CONVERSION_EVENTS).toContain(name);
    }
    expect(GA_EVENTS_NOT_APPLICABLE).toContain("schedule_appointment");
  });

  it("ships KPI, rank, and AI monitoring artifacts", () => {
    for (const file of [
      "section_8_analytics.md",
      "kpi_dashboard.md",
      "rank_tracking.md",
      "rank_keywords_top50.csv",
      "ai_visibility_protocol.md",
      "ai_visibility_log.csv",
      "analytics_setup.md",
    ]) {
      expect(existsSync(join(seoDir, file))).toBe(true);
    }
  });

  it("tracks 50 keywords for rank monitoring", () => {
    const raw = readFileSync(join(seoDir, "rank_keywords_top50.csv"), "utf8").trim();
    const lines = raw.split(/\r?\n/);
    expect(lines[0]).toContain("Keyword");
    expect(lines.length - 1).toBe(50);
  });

  it("documents Looker Studio KPI targets from the master prompt", () => {
    const body = readFileSync(join(seoDir, "kpi_dashboard.md"), "utf8");
    expect(body).toMatch(/\+30%/);
    expect(body).toMatch(/≤ 2\.5s/);
    expect(body).toMatch(/AI Citation Rate/i);
  });
});
