// lib/cms/types.ts
export type CmsPage = {
  slug: string;
  title: string;
  body: string; // markdown-ish plain text / HTML-safe paragraphs
  status: "draft" | "published";
  updatedAt: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: "draft" | "published";
  publishedAt: string;
  updatedAt: string;
};

export type HomepageBanner = {
  enabled: boolean;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomepageSectionId =
  | "hero"
  | "banner"
  | "trust"
  | "categories"
  | "awards"
  | "bundles"
  | "product-lines"
  | "rewards"
  | "locator"
  | "validate"
  | "newsletter";

export type HomepageSection = {
  id: HomepageSectionId;
  enabled: boolean;
  /** Optional copy override (hero / rewards / locator / validate / newsletter). */
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type HomepageLayout = {
  sections: HomepageSection[];
};
