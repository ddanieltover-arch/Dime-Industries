// lib/admin/reviews-store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  filterApprovedForProduct,
  type ProductReview,
  type ReviewStatus,
} from "@/lib/reviews/logic";

export const ADMIN_REVIEWS_COOKIE = "dime_admin_reviews";

const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productSlug: z.string().default(""),
  productName: z.string(),
  authorEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  body: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.string(),
});

export type AdminReview = z.infer<typeof reviewSchema>;

const jarSchema = z.object({
  reviews: z.array(reviewSchema).max(200),
  seeded: z.boolean().optional(),
});

const SEED: AdminReview[] = [
  {
    id: "rev_seed_1",
    productId: "p-banana-mac",
    productSlug: "banana-mac",
    productName: "Banana Mac Live Reserve Vape",
    authorEmail: "alex@example.com",
    rating: 5,
    body: "Clean flavor, strong effects. Would buy again.",
    status: "approved",
    createdAt: "2026-07-10T12:00:00.000Z",
  },
  {
    id: "rev_seed_2",
    productId: "p-berry-white",
    productSlug: "berry-white",
    productName: "Berry White Vape",
    authorEmail: "sam@example.com",
    rating: 4,
    body: "Battery lasts. Flavor is solid for the price.",
    status: "approved",
    createdAt: "2026-07-12T15:30:00.000Z",
  },
  {
    id: "rev_seed_3",
    productId: "p-afternoon",
    productSlug: "afternoon",
    productName: "Afternoon Softgels: THC, CBD, CBG Blend",
    authorEmail: "jordan@example.com",
    rating: 2,
    body: "Took longer than expected to kick in.",
    status: "approved",
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "rev_seed_4",
    productId: "p-banana-mac",
    productSlug: "banana-mac",
    productName: "Banana Mac Live Reserve Vape",
    authorEmail: "casey@example.com",
    rating: 5,
    body: "Live resin taste is on point — smooth draw every time.",
    status: "approved",
    createdAt: "2026-07-18T10:00:00.000Z",
  },
  {
    id: "rev_seed_pending",
    productId: "p-black-ice",
    productSlug: "black-ice",
    productName: "Black Ice Rosin Vape",
    authorEmail: "pending@example.com",
    rating: 3,
    body: "Decent, waiting on a second try before I decide.",
    status: "pending",
    createdAt: "2026-07-20T08:00:00.000Z",
  },
];

function normalize(review: AdminReview): AdminReview {
  return {
    ...review,
    productSlug: review.productSlug || "",
  };
}

async function readJar(): Promise<{ reviews: AdminReview[]; seeded: boolean }> {
  const store = await cookies();
  const raw = store.get(ADMIN_REVIEWS_COOKIE)?.value;
  if (!raw) return { reviews: SEED.map(normalize), seeded: true };
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success) return { reviews: SEED.map(normalize), seeded: true };
    const reviews = (parsed.data.seeded ? parsed.data.reviews : [...SEED, ...parsed.data.reviews]).map(
      normalize
    );
    return { reviews, seeded: true };
  } catch {
    return { reviews: SEED.map(normalize), seeded: true };
  }
}

async function writeJar(reviews: AdminReview[]): Promise<void> {
  const store = await cookies();
  store.set(
    ADMIN_REVIEWS_COOKIE,
    encodeURIComponent(JSON.stringify({ reviews, seeded: true })),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    }
  );
}

export async function listReviews(status?: ReviewStatus): Promise<AdminReview[]> {
  const { reviews } = await readJar();
  const list = status ? reviews.filter((r) => r.status === status) : reviews;
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listApprovedReviewsForProduct(product: {
  id: string;
  slug: string;
}): Promise<ProductReview[]> {
  const { reviews } = await readJar();
  return filterApprovedForProduct(reviews as ProductReview[], product);
}

export async function setReviewStatus(
  reviewId: string,
  status: ReviewStatus
): Promise<AdminReview | null> {
  const { reviews } = await readJar();
  const idx = reviews.findIndex((r) => r.id === reviewId);
  if (idx < 0) return null;
  reviews[idx] = { ...reviews[idx]!, status };
  await writeJar(reviews);
  return reviews[idx]!;
}

export async function submitReview(input: {
  productId: string;
  productSlug: string;
  productName: string;
  authorEmail: string;
  rating: number;
  body: string;
}): Promise<{ ok: true; review: AdminReview } | { ok: false; error: string }> {
  const rating = Math.round(input.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be 1–5." };
  }
  const body = input.body.trim();
  if (body.length < 8) return { ok: false, error: "Review needs at least a short sentence." };
  if (body.length > 2000) return { ok: false, error: "Review is too long." };

  const email = input.authorEmail.trim().toLowerCase();
  const { reviews } = await readJar();
  const duplicate = reviews.find(
    (r) =>
      r.authorEmail.toLowerCase() === email &&
      (r.productId === input.productId || r.productSlug === input.productSlug) &&
      r.status !== "rejected"
  );
  if (duplicate) {
    return { ok: false, error: "You already submitted a review for this product." };
  }

  const review: AdminReview = {
    id: `rev_${crypto.randomUUID().slice(0, 10)}`,
    productId: input.productId,
    productSlug: input.productSlug,
    productName: input.productName,
    authorEmail: email,
    rating,
    body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  reviews.unshift(review);
  await writeJar(reviews.slice(0, 200));
  return { ok: true, review };
}
