// components/product/product-reviews.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  submitProductReviewAction,
  type ReviewActionState,
} from "@/app/(commerce)/review-actions";
import { averageRating, maskReviewAuthor, type ProductReview } from "@/lib/reviews/logic";

const initial: ReviewActionState = {};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="font-[var(--font-mono)] text-[var(--scale-xs)] tracking-widest text-[var(--color-resin)]" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-[var(--color-ink-muted)]">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ProductReviews({
  productSlug,
  productName,
  reviews,
  signedIn,
}: {
  productSlug: string;
  productName: string;
  reviews: ProductReview[];
  signedIn: boolean;
}) {
  const [state, action, pending] = useActionState(submitProductReviewAction, initial);
  const avg = averageRating(reviews);

  return (
    <section
      className="mt-16 border-t border-[var(--color-border)] pt-14"
      aria-labelledby="reviews-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-heading" className="section-title">
            Reviews
          </h2>
          <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            {reviews.length === 0
              ? "No approved reviews yet — be the first."
              : avg != null
                ? `${avg} average · ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                : null}
          </p>
        </div>
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-8 space-y-4" role="list">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={review.rating} />
                <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                  {maskReviewAuthor(review.authorEmail)} · {review.createdAt.slice(0, 10)}
                </p>
              </div>
              <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                {review.body}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
        <h3 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
          Write a review
        </h3>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Reviews for {productName} appear after moderation.
        </p>

        {!signedIn ? (
          <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink)]">
            <Link href={`/login?next=/product/${productSlug}`} className="text-[var(--color-resin)] underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        ) : (
          <form action={action} className="mt-4 space-y-3">
            <input type="hidden" name="productSlug" value={productSlug} />
            <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              Rating
              <select
                name="rating"
                defaultValue="5"
                required
                className="mt-1 block w-full max-w-[12rem] rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-2 py-1.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              Your review
              <textarea
                name="body"
                rows={4}
                required
                minLength={8}
                maxLength={2000}
                placeholder="How was the experience?"
                className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
              />
            </label>
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
              {pending ? "Submitting…" : "Submit review"}
            </button>
            {state.error ? (
              <p role="alert" className="text-[var(--scale-xs)] text-[var(--color-flag)]">
                {state.error}
              </p>
            ) : null}
            {state.success ? (
              <p role="status" className="text-[var(--scale-xs)] text-[var(--color-terp)]">
                {state.success}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}

export function ProductRatingSummary({ reviews }: { reviews: ProductReview[] }) {
  const avg = averageRating(reviews);
  if (!reviews.length || avg == null) return null;
  return (
    <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
      <span className="text-[var(--color-resin)]">{avg}</span>
      <span className="mx-1 text-[var(--color-ink-muted)]">·</span>
      {reviews.length} review{reviews.length === 1 ? "" : "s"}
    </p>
  );
}
