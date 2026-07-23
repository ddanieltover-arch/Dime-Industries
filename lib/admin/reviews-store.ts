// lib/admin/reviews-store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";

export const ADMIN_REVIEWS_COOKIE = "dime_admin_reviews";

const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  authorEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  body: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.string(),
});

export type AdminReview = z.infer<typeof reviewSchema>;

const jarSchema = z.object({
  reviews: z.array(reviewSchema).max(100),
  seeded: z.boolean().optional(),
});

const SEED: AdminReview[] = [
  {
    id: "rev_seed_1",
    productId: "p-lr-gelato",
    productName: "Gelato Cartridge",
    authorEmail: "alex@example.com",
    rating: 5,
    body: "Clean flavor, strong effects. Would buy again.",
    status: "pending",
    createdAt: "2026-07-10T12:00:00.000Z",
  },
  {
    id: "rev_seed_2",
    productId: "p-sig-blue",
    productName: "Blue Dream AIO",
    authorEmail: "sam@example.com",
    rating: 4,
    body: "Battery lasts. Flavor is solid for the price.",
    status: "pending",
    createdAt: "2026-07-12T15:30:00.000Z",
  },
  {
    id: "rev_seed_3",
    productId: "p-bal-gummy",
    productName: "Citrus Balanced Gummies",
    authorEmail: "jordan@example.com",
    rating: 2,
    body: "Took longer than expected to kick in.",
    status: "approved",
    createdAt: "2026-07-01T09:00:00.000Z",
  },
];

async function readJar(): Promise<{ reviews: AdminReview[]; seeded: boolean }> {
  const store = await cookies();
  const raw = store.get(ADMIN_REVIEWS_COOKIE)?.value;
  if (!raw) return { reviews: [...SEED], seeded: true };
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success) return { reviews: [...SEED], seeded: true };
    return {
      reviews: parsed.data.seeded ? parsed.data.reviews : [...SEED, ...parsed.data.reviews],
      seeded: true,
    };
  } catch {
    return { reviews: [...SEED], seeded: true };
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

export async function listReviews(status?: AdminReview["status"]): Promise<AdminReview[]> {
  const { reviews } = await readJar();
  const list = status ? reviews.filter((r) => r.status === status) : reviews;
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setReviewStatus(
  reviewId: string,
  status: AdminReview["status"]
): Promise<AdminReview | null> {
  const { reviews } = await readJar();
  const idx = reviews.findIndex((r) => r.id === reviewId);
  if (idx < 0) return null;
  reviews[idx] = { ...reviews[idx]!, status };
  await writeJar(reviews);
  return reviews[idx]!;
}
