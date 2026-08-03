// lib/seo/cms-meta.ts — derive SEO fields from CMS body text
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/site";

/** Strip CMS heading markers and collapse whitespace for meta descriptions. */
export function excerptFromCmsBody(body: string, maxLen = 155): string {
  const plain = body
    .replace(/^###\s+/gm, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  const slice = plain.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

export function buildCmsPageMetadata(input: {
  title: string;
  body: string;
  path: string;
}): Metadata {
  const description = excerptFromCmsBody(input.body);
  const canonical = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const ogImage = absoluteUrl("/brand/og.png");
  return {
    title: input.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: input.title,
      description,
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
  };
}
