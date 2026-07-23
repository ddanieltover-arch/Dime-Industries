// app/(commerce)/wishlist-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { findVariantAcrossCatalog } from "@/lib/cart/catalog-lookup";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { toggleWishlist } from "@/lib/wishlist";

export type WishlistActionState = {
  ok?: boolean;
  error?: string;
  inWishlist?: boolean;
  count?: number;
};

export async function toggleWishlistItem(
  _prev: WishlistActionState,
  formData: FormData
): Promise<WishlistActionState> {
  const gate = await getAgeGateState();
  if (!gate.ageVerified) return { error: "Age verification required." };

  const variantId = String(formData.get("variantId") ?? "");
  const found = findVariantAcrossCatalog(variantId);
  if (!found) return { error: "Variant not found." };

  const snap = await toggleWishlist(variantId);
  revalidatePath("/wishlist");
  revalidatePath("/", "layout");
  revalidatePath(`/product/${found.product.slug}`);
  return {
    ok: true,
    inWishlist: snap.variantIds.includes(variantId),
    count: snap.count,
  };
}
