// lib/wishlist/cookie.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { createCatalogLookup } from "@/lib/cart/catalog-lookup";
import { toCartLine } from "@/lib/cart/logic";
import type { CartLine } from "@/lib/cart/types";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import { addWishlistId, mergeWishlistIds, toggleWishlistId } from "./logic";
import { WISHLIST_COOKIE, WISHLIST_MAX, type WishlistSnapshot } from "./types";
import { readDbWishlistIds, wishlistOwnerKey, writeDbWishlistIds } from "./wishlist-db";

const schema = z.object({
  variantIds: z.array(z.string().min(1).max(80)).max(WISHLIST_MAX),
});

async function readCookieWishlistIds(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(WISHLIST_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = schema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.variantIds : [];
  } catch {
    return [];
  }
}

async function writeCookieWishlistIds(variantIds: string[]): Promise<void> {
  const store = await cookies();
  store.set(WISHLIST_COOKIE, encodeURIComponent(JSON.stringify({ variantIds })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

async function currentOwnerEmail(): Promise<string | null> {
  try {
    const { getCurrentProfile } = await import("@/lib/auth/session");
    const profile = await getCurrentProfile();
    return profile?.email ?? null;
  } catch {
    return null;
  }
}

export async function readWishlistIds(): Promise<string[]> {
  const email = await currentOwnerEmail();
  if (email && isGrowthDatabaseMode()) {
    return readDbWishlistIds(wishlistOwnerKey(email));
  }
  return readCookieWishlistIds();
}

export async function writeWishlistIds(variantIds: string[]): Promise<void> {
  const email = await currentOwnerEmail();
  if (email && isGrowthDatabaseMode()) {
    await writeDbWishlistIds(wishlistOwnerKey(email), variantIds);
    await writeCookieWishlistIds(variantIds);
    return;
  }
  await writeCookieWishlistIds(variantIds);
}

export async function getWishlistSnapshot(): Promise<WishlistSnapshot> {
  const variantIds = await readWishlistIds();
  return { variantIds, count: variantIds.length };
}

export async function getWishlistLines(): Promise<CartLine[]> {
  const ids = await readWishlistIds();
  const lookup = createCatalogLookup();
  const lines: CartLine[] = [];
  for (const id of ids) {
    const found = lookup.findVariant(id);
    if (!found) continue;
    lines.push(toCartLine(found.product, found.variant, 1));
  }
  return lines;
}

export async function toggleWishlist(variantId: string): Promise<WishlistSnapshot> {
  const next = toggleWishlistId(await readWishlistIds(), variantId);
  await writeWishlistIds(next);
  return { variantIds: next, count: next.length };
}

/**
 * After login: merge guest cookie wishlist into the user's durable wishlist.
 */
export async function mergeGuestWishlistForUser(email: string): Promise<void> {
  const guestIds = await readCookieWishlistIds();
  if (guestIds.length === 0) {
    if (isGrowthDatabaseMode()) {
      const dbIds = await readDbWishlistIds(wishlistOwnerKey(email));
      await writeCookieWishlistIds(dbIds);
    }
    return;
  }

  if (isGrowthDatabaseMode()) {
    const existing = await readDbWishlistIds(wishlistOwnerKey(email));
    const merged = mergeWishlistIds(existing, guestIds);
    await writeDbWishlistIds(wishlistOwnerKey(email), merged);
    await writeCookieWishlistIds(merged);
    return;
  }

  // Cookie-only: keep union in cookie under guest session (no durable user key).
  const current = await readCookieWishlistIds();
  await writeCookieWishlistIds(mergeWishlistIds(current, guestIds));
}

export { addWishlistId };
