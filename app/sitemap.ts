// app/sitemap.ts
// Curated catalog routes + live CMS blog posts (seed fallback during build).
import type { MetadataRoute } from "next";
import { CATALOG_CATEGORIES, CATALOG_LINES, listAllActiveSlugs } from "@/lib/catalog";
import { listBlogPosts } from "@/lib/cms/store";
import { absoluteUrl, SEO_BLOG_SLUGS, SEO_STATIC_PATHS } from "@/lib/seo/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categoryRoutes = CATALOG_CATEGORIES.map((c) => `/shop/${c.slug}`);
  const lineRoutes = CATALOG_CATEGORIES.flatMap((c) =>
    CATALOG_LINES.map((l) => `/shop/${c.slug}/${l.slug}`)
  );
  const productRoutes = listAllActiveSlugs().map((slug) => `/product/${slug}`);

  let blogSlugs: string[] = [...SEO_BLOG_SLUGS];
  try {
    const posts = await listBlogPosts(false);
    const fromCms = posts.map((p) => p.slug);
    blogSlugs = [...new Set([...SEO_BLOG_SLUGS, ...fromCms])];
  } catch {
    // Build/runtime without DB — keep seed slugs.
  }
  const blogRoutes = blogSlugs.map((slug) => `/blog/${slug}`);

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
    priority: path === "" ? 1 : path.startsWith("/product/") ? 0.8 : path.startsWith("/blog/") ? 0.75 : 0.7,
  }));
}
