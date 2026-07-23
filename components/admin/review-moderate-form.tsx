// components/admin/review-moderate-form.tsx
"use client";

import { useActionState } from "react";
import { moderateReview, type AdminActionState } from "@/app/(admin)/actions";

const initial: AdminActionState = {};

export function ReviewModerateForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(moderateReview, initial);
  return (
    <form action={action} className="flex flex-wrap gap-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <button
        type="submit"
        name="status"
        value="approved"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1.5 text-[var(--scale-xs)] text-[var(--color-surface)] disabled:opacity-60"
      >
        Approve
      </button>
      <button
        type="submit"
        name="status"
        value="rejected"
        disabled={pending}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] px-3 py-1.5 text-[var(--scale-xs)] text-[var(--color-ink)] disabled:opacity-60"
      >
        Reject
      </button>
      {state.message ? <span className="text-[var(--scale-xs)] text-[var(--color-terp)]">{state.message}</span> : null}
    </form>
  );
}
