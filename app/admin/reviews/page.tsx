// app/admin/reviews/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listReviews } from "@/lib/admin/reviews-store";
import { ReviewModerateForm } from "@/components/admin/review-moderate-form";

export const metadata: Metadata = {
  title: "Admin reviews",
  robots: { index: false, follow: false },
};

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await listReviews();
  const pending = reviews.filter((r) => r.status === "pending");
  const others = reviews.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Reviews
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Moderation queue. Seeded samples included for demo.
        </p>
      </div>

      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Pending ({pending.length})
        </h3>
        <ul className="mt-4 space-y-4" role="list">
          {pending.length === 0 ? (
            <li className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">Queue clear.</li>
          ) : (
            pending.map((review) => (
              <li key={review.id} className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
                <p className="font-[var(--font-display)] text-[var(--color-ink)]">
                  {review.productName} · {review.rating}/5
                </p>
                <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{review.body}</p>
                <p className="mt-1 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                  {review.authorEmail}
                </p>
                <div className="mt-3">
                  <ReviewModerateForm reviewId={review.id} />
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Moderated
        </h3>
        <ul className="mt-4 space-y-3" role="list">
          {others.map((review) => (
            <li key={review.id} className="border border-[var(--color-border)] px-4 py-3 text-[var(--scale-sm)]">
              <span className="font-[var(--font-mono)] text-[var(--color-ink-soft)]">{review.status}</span>
              {" · "}
              {review.productName} · {review.rating}/5
              {review.productSlug ? (
                <>
                  {" · "}
                  <a
                    href={`/product/${review.productSlug}`}
                    className="text-[var(--color-resin)] underline-offset-4 hover:underline"
                  >
                    PDP
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
