// lib/reviews/logic.ts — pure helpers (unit-testable)
export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProductReview = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  authorEmail: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  createdAt: string;
};

export function matchProductReview(
  review: Pick<ProductReview, "productId" | "productSlug">,
  product: { id: string; slug: string }
): boolean {
  return review.productId === product.id || review.productSlug === product.slug;
}

export function filterApprovedForProduct(
  reviews: ProductReview[],
  product: { id: string; slug: string }
): ProductReview[] {
  return reviews
    .filter((r) => r.status === "approved" && matchProductReview(r, product))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function averageRating(reviews: Pick<ProductReview, "rating">[]): number | null {
  if (!reviews.length) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function maskReviewAuthor(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "Customer";
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}
