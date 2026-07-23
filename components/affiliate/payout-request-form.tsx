// components/affiliate/payout-request-form.tsx
"use client";

import { useActionState } from "react";
import {
  requestPayoutAction,
  type AffiliateActionState,
} from "@/app/(commerce)/affiliate-actions";
import { formatPrice } from "@/lib/format";

const initial: AffiliateActionState = {};

export function PayoutRequestForm({
  availableCents,
  minCents,
}: {
  availableCents: number;
  minCents: number;
}) {
  const [state, action, pending] = useActionState(requestPayoutAction, initial);
  const disabled = availableCents < minCents;

  return (
    <form action={action} className="mt-4 space-y-3">
      <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Available to request: {formatPrice(availableCents)} (min {formatPrice(minCents)})
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="number"
          name="amountDollars"
          step="0.01"
          min={minCents / 100}
          max={availableCents / 100}
          defaultValue={(availableCents / 100).toFixed(2)}
          disabled={disabled}
          className="w-32 border border-[var(--color-border)] px-2 py-1 text-[var(--scale-sm)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || disabled}
          className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-1 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Request payout"}
        </button>
      </div>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-terp)]">{state.success}</p>
      ) : null}
    </form>
  );
}
