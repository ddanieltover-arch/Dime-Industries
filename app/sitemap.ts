// app/sitemap.ts
import type { MetadataRoute } from "next";
import { CATALOG_CATEGORIES, CATALOG_LINES, listAllActiveSlugs } from "@/lib/catalog";
import { absoluteUrl, SEO_BLOG_SLUGS, SEO_STATIC_PATHS } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryRoutes = CATALOG_CATEGORIES.map((c) => `/shop/${c.slug}`);
  const lineRoutes = CATALOG_CATEGORIES.flatMap((c) =>
    CATALOG_LINES.map((l) => `/shop/${c.slug}/${l.slug}`)
  );
  const productRoutes = listAllActiveSlugs().map((slug) => `/product/${slug}`);
  const blogRoutes = SEO_BLOG_SLUGS.map((slug) => `/blog/${slug}`);

  const all = [
    ...SEO_STATIC_PATHS,
    ...categoryRoutes,
    ...lineRoutes,
    ...productRoutes,
    ...blogRoutes,
  ];

  return all.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/shop" ? "daily" : "weekly",
    priority: path === "" ? 1 : path.startsWith("/product/") ? 0.8 : 0.7,
  }));
}
