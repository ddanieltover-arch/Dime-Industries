// app/(commerce)/review-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/session";
import { submitReview } from "@/lib/admin/reviews-store";
import { getProductBySlug, withCatalogSource } from "@/lib/catalog";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";

export type ReviewActionState = {
  error?: string;
  success?: string;
};

export async function submitProductReviewAction(
  _prev: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const profile = await getCurrentProfile();
  if (!profile?.email) {
    return { error: "Sign in to leave a review." };
  }

  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "");
  if (!productSlug) return { error: "Missing product." };

  const catalog = await loadEffectiveCatalog();
  const product = withCatalogSource(catalog, () => getProductBySlug(productSlug));
  if (!product || product.status !== "active") {
    return { error: "Product not found." };
  }

  const result = await submitReview({
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    authorEmail: profile.email,
    rating,
    body,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/admin/reviews");
  return { success: "Thanks — your review is pending moderation." };
}
