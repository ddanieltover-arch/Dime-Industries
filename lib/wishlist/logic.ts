// lib/wishlist/logic.ts
import { WISHLIST_MAX } from "./types";

export function toggleWishlistId(ids: string[], variantId: string): string[] {
  if (ids.includes(variantId)) return ids.filter((id) => id !== variantId);
  if (ids.length >= WISHLIST_MAX) return ids;
  return [...ids, variantId];
}

export function addWishlistId(ids: string[], variantId: string): string[] {
  if (ids.includes(variantId)) return ids;
  if (ids.length >= WISHLIST_MAX) return ids;
  return [...ids, variantId];
}

export function removeWishlistId(ids: string[], variantId: string): string[] {
  return ids.filter((id) => id !== variantId);
}

export function mergeWishlistIds(
  existing: string[],
  guest: string[],
  max = WISHLIST_MAX
): string[] {
  const out = [...existing];
  for (const id of guest) {
    if (out.includes(id)) continue;
    if (out.length >= max) break;
    out.push(id);
  }
  return out;
}
