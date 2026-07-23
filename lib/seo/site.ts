// lib/seo/site.ts
/** Canonical production origin — used by robots, sitemap, and JSON-LD. */
export const SITE_URL = "https://dimeindustries.us";

export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Public marketing/CMS paths always present in the seed CMS. */
export const SEO_STATIC_PATHS = [
  "",
  "/shop",
  "/wholesale",
  "/locations",
  "/about",
  "/contact",
  "/blog",
  "/faq",
  "/legal/terms",
  "/legal/privacy",
  "/legal/medical-privacy",
  "/legal/returns",
] as const;

/** Seed blog posts (cookie CMS may add more at runtime; sitemap uses seeds for build safety). */
export const SEO_BLOG_SLUGS = ["how-we-publish-coas", "shopping-by-potency"] as const;

export const SEO_DISALLOW_PATHS = [
  "/admin",
  "/account",
  "/cart",
  "/checkout",
  "/wishlist",
  "/login",
  "/signup",
  "/api",
  "/r",
] as const;
