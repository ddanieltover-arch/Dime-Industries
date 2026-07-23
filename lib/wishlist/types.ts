// lib/wishlist/types.ts
export const WISHLIST_COOKIE = "dime_wishlist";
export const WISHLIST_MAX = 40;

export type WishlistSnapshot = {
  variantIds: string[];
  count: number;
};
