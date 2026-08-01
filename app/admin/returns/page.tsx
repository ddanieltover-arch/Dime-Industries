// app/admin/returns/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { returnsAdminSummary } from "@/lib/returns/store";
import { AdminReturnReviewPanel } from "@/components/admin/return-review-panel";

export const metadata: Metadata = {
  title: "Admin returns",
  robots: { index: false, follow: false },
};

export default async function AdminReturnsPage() {
  await requireAdmin();
  const { returns, requestedCount, approvedCount, refundedCount } = await returnsAdminSummary();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)]">
          Returns
        </h2>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Review customer return requests. Refunds are marked manually after finance completes the
          Paybis or NET adjustment.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-[var(--scale-sm)]">
          <div className="border border-[var(--color-border)] p-3">
            <dt className="text-[var(--color-ink-soft)]">Requested</dt>
            <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)]">
              {requestedCount}
            </dd>
          </div>
          <div className="border border-[var(--color-border)] p-3">
            <dt className="text-[var(--color-ink-soft)]">Approved</dt>
            <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)]">
              {approvedCount}
            </dd>
          </div>
          <div className="border border-[var(--color-border)] p-3">
            <dt className="text-[var(--color-ink-soft)]">Refunded</dt>
            <dd className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)]">
              {refundedCount}
            </dd>
          </div>
        </dl>
      </section>

      <AdminReturnReviewPanel returns={returns} />
    </div>
  );
}
