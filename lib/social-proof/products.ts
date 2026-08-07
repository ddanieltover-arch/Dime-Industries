// lib/social-proof/products.ts
// Slim product list for purchase social-proof (server-only source).

import { SEED_CATALOG } from "@/lib/catalog/seed-catalog";
import type { SocialProofProduct } from "@/lib/social-proof/purchase-notifications";

const EXCLUDED_CATEGORIES = new Set(["accessories"]);
const MAX_POOL = 36;

/** Active shoppable SKUs used for randomized purchase toasts. */
export function getSocialProofProducts(): SocialProofProduct[] {
  return SEED_CATALOG.filter(
    (p) =>
      p.status === "active" &&
      !EXCLUDED_CATEGORIES.has(p.categorySlug) &&
      Boolean(p.imageUrl),
  )
    .slice()
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, MAX_POOL)
    .map((p) => ({ slug: p.slug, name: p.name, imageUrl: p.imageUrl }));
}
