// components/account/return-request-form.tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestReturnAction,
  type ReturnActionState,
} from "@/app/(commerce)/return-actions";
import { RETURN_REASON_LABELS, type ReturnReason } from "@/lib/returns/types";

const initial: ReturnActionState = {};

const REASONS = Object.entries(RETURN_REASON_LABELS) as [ReturnReason, string][];

export function ReturnRequestForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(requestReturnAction, initial);

  return (
    <section
      aria-labelledby="return-request-heading"
      className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <h3
        id="return-request-heading"
        className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
      >
        Request a return
      </h3>
      <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Defective hardware and shipping issues may qualify under our{" "}
        <Link href="/legal/returns" className="text-[var(--color-resin)] hover:underline">
          Returns Policy
        </Link>
        . Validate the product when possible before submitting.
      </p>

      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="orderId" value={orderId} />
        <label className="flex flex-col gap-1.5 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Reason
          <select name="reason" required className="field-input">
            <option value="">Select a reason</option>
            {REASONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Details (optional)
          <textarea
            name="details"
            rows={3}
            maxLength={2000}
            placeholder="SKU, photos description, retailer, or validation code…"
            className="field-input resize-y"
          />
        </label>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Submitting…" : "Submit return request"}
        </button>
        {state.error ? (
          <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="text-[var(--scale-sm)] text-[var(--color-resin)]">
            {state.success}
          </p>
        ) : null}
      </form>
    </section>
  );
}
