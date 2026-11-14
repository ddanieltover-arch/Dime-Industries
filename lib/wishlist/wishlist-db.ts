// lib/wishlist/wishlist-db.ts
import "server-only";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { commerceWishlists } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { withTimeout } from "@/lib/async/with-timeout";
import { WISHLIST_MAX } from "./types";

const WISHLIST_DB_TIMEOUT_MS = 2_000;

const idsSchema = z.array(z.string().min(1).max(80)).max(WISHLIST_MAX);

export function wishlistOwnerKey(email: string) {
  return email.trim().toLowerCase();
}

async function readDbWishlistIdsUnbudgeted(ownerKey: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(commerceWishlists)
    .where(eq(commerceWishlists.ownerKey, ownerKey))
    .limit(1);
  const parsed = idsSchema.safeParse(rows[0]?.variantIds ?? []);
  return parsed.success ? parsed.data : [];
}

/** Throws on timeout so callers can fall back to the cookie mirror. */
export async function readDbWishlistIds(ownerKey: string): Promise<string[]> {
  return withTimeout(
    readDbWishlistIdsUnbudgeted(ownerKey),
    WISHLIST_DB_TIMEOUT_MS,
    "wishlist-db-read"
  );
}

export async function writeDbWishlistIds(ownerKey: string, variantIds: string[]): Promise<void> {
  const db = getDb();
  const clipped = variantIds.slice(0, WISHLIST_MAX);
  await db
    .insert(commerceWishlists)
    .values({
      ownerKey,
      variantIds: clipped,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: commerceWishlists.ownerKey,
      set: { variantIds: clipped, updatedAt: new Date() },
    });
}
