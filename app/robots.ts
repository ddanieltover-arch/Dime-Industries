// app/robots.ts
// Static disallow list — SEO present, not automation.
// Explicitly allow major AI crawlers for GEO/citation eligibility.
import type { MetadataRoute } from "next";
import { SEO_DISALLOW_PATHS, SITE_URL } from "@/lib/seo/site";

const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...SEO_DISALLOW_PATHS],
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/" as const,
        disallow: [...SEO_DISALLOW_PATHS],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
