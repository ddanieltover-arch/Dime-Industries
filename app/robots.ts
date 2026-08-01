// app/robots.ts
// Static disallow list — SEO present, not automation.
import type { MetadataRoute } from "next";
import { SEO_DISALLOW_PATHS, SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...SEO_DISALLOW_PATHS],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
