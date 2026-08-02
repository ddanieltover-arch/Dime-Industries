// lib/seo/json-ld.ts — shared JSON-LD builders for public pages
import { absoluteUrl, SITE_URL } from "@/lib/seo/site";

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildBlogPostingJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
}): Record<string, unknown> {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl("/brand/og.png"),
    author: {
      "@type": "Organization",
      name: "DIME Industries",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "DIME Industries",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/logo.png"),
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };
}

export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DIME Industries",
    url: SITE_URL,
    description:
      "Award-winning cannabis vapes, edibles, and prerolls from DIME Industries.",
  };
}
