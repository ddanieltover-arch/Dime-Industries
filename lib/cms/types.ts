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
