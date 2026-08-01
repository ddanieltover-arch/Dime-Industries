import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOMEPAGE_LAYOUT,
  HOME_SECTION_IDS,
  isSectionEnabled,
  normalizeHomepageLayout,
} from "@/lib/cms/homepage-layout";

describe("homepage layout", () => {
  it("defaults include every registry section enabled", () => {
    expect(DEFAULT_HOMEPAGE_LAYOUT.sections.map((s) => s.id)).toEqual([...HOME_SECTION_IDS]);
    expect(DEFAULT_HOMEPAGE_LAYOUT.sections.every((s) => s.enabled)).toBe(true);
  });

  it("fills missing sections and drops unknowns", () => {
    const normalized = normalizeHomepageLayout({
      sections: [
        { id: "newsletter", enabled: false },
        { id: "hero", enabled: true, headline: "  Custom  ", body: "" },
        { id: "not-a-section", enabled: true },
        { id: "hero", enabled: false },
      ],
    });

    expect(normalized.sections[0]).toEqual({
      id: "newsletter",
      enabled: false,
    });
    expect(normalized.sections[1]).toEqual({
      id: "hero",
      enabled: true,
      headline: "Custom",
    });
    expect(normalized.sections.map((s) => s.id)[0]).toBe("newsletter");
    expect(new Set(normalized.sections.map((s) => s.id))).toEqual(new Set(HOME_SECTION_IDS));
    expect(normalized.sections).toHaveLength(HOME_SECTION_IDS.length);
    expect(isSectionEnabled(normalized, "newsletter")).toBe(false);
    expect(isSectionEnabled(normalized, "banner")).toBe(true);
  });

  it("recovers from invalid payloads", () => {
    const normalized = normalizeHomepageLayout({ sections: [] });
    expect(normalized.sections).toHaveLength(HOME_SECTION_IDS.length);
  });
});
