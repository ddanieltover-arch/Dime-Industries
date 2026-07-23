// lib/recently-viewed/cookie.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { getProductBySlug, toProductCard } from "@/lib/catalog";
import type { ProductCardModel } from "@/lib/catalog/types";
import { pushRecentSlug, RECENT_MAX } from "./logic";

export const RECENT_COOKIE = "dime_recent";

const schema = z.object({
  slugs: z.array(z.string().min(1).max(120)).max(RECENT_MAX),
});

export async function readRecentSlugs(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(RECENT_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = schema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.slugs : [];
  } catch {
    return [];
  }
}

export async function recordProductView(
  slug: string,
  jurisdiction?: string | null
): Promise<void> {
  // Only record if the product is visible in this jurisdiction
  if (!getProductBySlug(slug, jurisdiction ?? null)) return;
  const next = pushRecentSlug(await readRecentSlugs(), slug);
  const store = await cookies();
  store.set(RECENT_COOKIE, encodeURIComponent(JSON.stringify({ slugs: next })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getRecentlyViewedCards(
  jurisdiction?: string | null,
  excludeSlug?: string
): Promise<ProductCardModel[]> {
  const slugs = await readRecentSlugs();
  const cards: ProductCardModel[] = [];
  for (const slug of slugs) {
    if (excludeSlug && slug === excludeSlug) continue;
    const product = getProductBySlug(slug, jurisdiction ?? null);
    if (!product) continue;
    cards.push(toProductCard(product));
  }
  return cards;
}
