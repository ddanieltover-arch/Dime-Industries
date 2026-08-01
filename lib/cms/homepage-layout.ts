// lib/cms/homepage-layout.ts — pure helpers (safe for client + unit tests)
import { z } from "zod";
import type { HomepageLayout, HomepageSection, HomepageSectionId } from "./types";

export const HOME_SECTION_IDS = [
  "hero",
  "banner",
  "trust",
  "categories",
  "awards",
  "bundles",
  "product-lines",
  "rewards",
  "locator",
  "validate",
  "newsletter",
] as const satisfies readonly HomepageSectionId[];

export const HOME_SECTION_LABELS: Record<HomepageSectionId, string> = {
  hero: "Hero",
  banner: "Promo banner",
  trust: "Trust strip",
  categories: "Category spotlight",
  awards: "Awards",
  bundles: "Bundles rail",
  "product-lines": "Product line rails",
  rewards: "Rewards teaser",
  locator: "Store locator",
  validate: "Validate products",
  newsletter: "Newsletter",
};

/** Sections that accept optional CMS copy overrides (banner uses its own CMS record). */
export const HOME_COPY_SECTION_IDS = [
  "hero",
  "rewards",
  "locator",
  "validate",
  "newsletter",
] as const satisfies readonly HomepageSectionId[];

export type HomeCopySectionId = (typeof HOME_COPY_SECTION_IDS)[number];

export function supportsHomeCopy(id: HomepageSectionId): id is HomeCopySectionId {
  return (HOME_COPY_SECTION_IDS as readonly string[]).includes(id);
}

const sectionSchema = z.object({
  id: z.enum(HOME_SECTION_IDS),
  enabled: z.boolean(),
  headline: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

export const homepageLayoutSchema = z.object({
  sections: z.array(sectionSchema).min(1),
});

export const DEFAULT_HOMEPAGE_LAYOUT: HomepageLayout = {
  sections: HOME_SECTION_IDS.map((id) => ({ id, enabled: true })),
};

function trimOpt(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

/** Merge saved layout with the registry: preserve order, fill missing ids, drop unknowns. */
export function normalizeHomepageLayout(input: unknown): HomepageLayout {
  const sectionsInput =
    input && typeof input === "object" && Array.isArray((input as { sections?: unknown }).sections)
      ? ((input as { sections: unknown[] }).sections)
      : [];

  const seen = new Set<HomepageSectionId>();
  const sections: HomepageSection[] = [];

  for (const row of sectionsInput) {
    const parsed = sectionSchema.safeParse(row);
    if (!parsed.success) continue;
    if (seen.has(parsed.data.id)) continue;
    seen.add(parsed.data.id);
    const next: HomepageSection = { id: parsed.data.id, enabled: parsed.data.enabled };
    if (supportsHomeCopy(parsed.data.id)) {
      const headline = trimOpt(parsed.data.headline);
      const body = trimOpt(parsed.data.body);
      const ctaLabel = trimOpt(parsed.data.ctaLabel);
      const ctaHref = trimOpt(parsed.data.ctaHref);
      if (headline) next.headline = headline;
      if (body) next.body = body;
      if (ctaLabel) next.ctaLabel = ctaLabel;
      if (ctaHref) next.ctaHref = ctaHref;
    }
    sections.push(next);
  }

  for (const id of HOME_SECTION_IDS) {
    if (!seen.has(id)) {
      sections.push({ id, enabled: true });
    }
  }

  return { sections };
}

export function isSectionEnabled(layout: HomepageLayout, id: HomepageSectionId): boolean {
  return layout.sections.find((s) => s.id === id)?.enabled ?? true;
}
