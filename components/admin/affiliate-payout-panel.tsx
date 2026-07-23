// components/admin/affiliate-payout-panel.tsx
"use client";

import { useActionState } from "react";
import {
  adminReviewPayoutAction,
  type AffiliateActionState,
} from "@/app/(commerce)/affiliate-actions";
import type { AffiliatePayout } from "@/lib/affiliate/payout-types";
import { formatPrice } from "@/lib/format";

const initial: AffiliateActionState = {};

export function AdminAffiliatePayoutPanel({ payouts }: { payouts: AffiliatePayout[] }) {
  const [state, action, pending] = useActionState(adminReviewPayoutAction, initial);
  const pendingPayouts = payouts.filter((p) => p.status === "pending");

  return (
    <div className="space-y-4">
      {pendingPayouts.length === 0 ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No pending payouts.</p>
      ) : (
        pendingPayouts.map((p) => (
          <form
            key={p.id}
            action={action}
            className="flex flex-wrap items-end justify-between gap-3 border border-[var(--color-border)] p-4"
          >
            <div>
              <p className="text-[var(--color-ink)]">{p.email}</p>
              <p className="font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                {p.id} · {formatPrice(p.amountCents)} · {new Date(p.createdAt).toLocaleDateString()}
              </p>
            </div>
            <input type="hidden" name="payoutId" value={p.id} />
            <input
              name="note"
              placeholder="Finance note"
              className="border border-[var(--color-border)] px-2 py-1 text-[var(--scale-sm)]"
            />
            <button
              type="submit"
              name="decision"
              value="paid"
              disabled={pending}
              className="border border-[var(--color-border)] px-3 py-1 text-[var(--scale-sm)]"
            >
              Mark paid
            </button>
            <button
              type="submit"
              name="decision"
              value="rejected"
              disabled={pending}
              className="border border-[var(--color-flag)] px-3 py-1 text-[var(--scale-sm)] text-[var(--color-flag)]"
            >
              Reject
            </button>
          </form>
        ))
      )}
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-terp)]">{state.success}</p>
      ) : null}
    </div>
  );
}
