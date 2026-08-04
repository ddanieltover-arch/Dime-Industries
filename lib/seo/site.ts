// lib/seo/site.ts
/**
 * SEO is present in the storefront (metadata, canonicals, robots, sitemap, JSON-LD).
 * Sitemap merges SEO_BLOG_SLUGS with live CMS posts via listBlogPosts() at runtime.
 * Faceted shop query URLs use noindex via catalogRobotsForFilters().
 */

/** Canonical production origin — used by robots, sitemap, and JSON-LD.
 * Must match Vercel Production host (www). Apex redirects 308 → www.
 */
export const SITE_URL = "https://www.dimeindustries.us";

export function absoluteUrl(path: string): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Public marketing/CMS paths always present in the seed CMS. */
export const SEO_STATIC_PATHS = [
  "",
  "/shop",
  "/shop/vapes/disposables",
  "/wholesale",
  "/locations",
  "/glossary",
  "/trust",
  "/facts",
  "/about",
  "/contact",
  "/blog",
  "/faq",
  "/careers",
  "/promotions",
  "/links",
  "/cookies",
  "/validate",
  "/lab-results",
  "/rewards",
  "/app",
  "/assistant",
  "/legal/terms",
  "/legal/privacy",
  "/legal/medical-privacy",
  "/legal/returns",
  "/legal/wholesale-rewards",
  "/locations/california",
  "/locations/massachusetts",
  "/locations/arizona",
  "/locations/montana",
  "/locations/nevada",
  "/locations/new-jersey",
  "/locations/new-mexico",
  "/locations/new-york",
  "/locations/oklahoma",
] as const;

/** Seed blog posts (cookie CMS may add more at runtime; sitemap uses seeds for build safety). */
export const SEO_BLOG_SLUGS = [
  "built-to-beat-leaks-the-dime-hardware-story",
  "dime-prerolls-are-coming-meet-dimepack-double-ds",
  "how-dime-state-exclusives-capture-a-place",
  "how-we-publish-coas",
  "shopping-by-potency",
  "how-many-dimes-in-a-roll",
  "what-is-a-dime-cart",
  "dime-cart-vs-disposable",
  "dime-live-reserve-explained",
  "signature-vs-live-reserve",
  "how-to-spot-fake-dime-carts",
  "how-to-use-a-dime-cart",
  "best-dime-industries-flavors",
  "live-resin-vs-live-rosin",
  "how-to-charge-a-dime-battery",
  "what-is-in-a-dime-cartridge",
  "are-dime-carts-worth-it",
  "why-is-my-dime-cart-clogged",
  "how-to-store-a-dime-cart",
  "what-is-dime-rosin",
  "solventless-cart-guide",
  "dime-signature-explained",
  "melted-diamonds-vape-explained",
  "dime-edibles-buying-guide",
  "dime-prerolls-buying-guide",
  "how-to-read-a-dime-coa",
  "dime-warranty-and-validate",
  "beginners-guide-to-dime-carts",
  "what-battery-for-dime-cart",
  "dime-balanced-explained",
  "dime-state-exclusive-guide",
  "buy-dime-carts-online",
  "dime-rewards-explained",
  "dime-hardware-accessories-guide",
  "lab-tested-dime-carts",
  "where-to-buy-dime-carts",
  "find-dime-los-angeles-orange-county",
  "find-dime-phoenix-arizona",
  "dime-promotions-safe-shopping",
] as const;

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
