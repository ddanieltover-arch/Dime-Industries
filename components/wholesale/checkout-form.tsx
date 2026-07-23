// components/wholesale/checkout-form.tsx
"use client";

import { useActionState } from "react";
import {
  startWholesaleCheckout,
  type WholesaleActionState,
} from "@/app/(commerce)/wholesale-actions";
import type { LaunchJurisdiction } from "@/lib/compliance/age-gate";
import type { PricingBreakdown } from "@/lib/checkout";
import type { PaymentTerms } from "@/lib/wholesale/types";

const initial: WholesaleActionState = {};

export function WholesaleCheckoutForm({
  email,
  jurisdiction,
  defaultTerms,
  pricing,
}: {
  email: string;
  jurisdiction: LaunchJurisdiction;
  defaultTerms: PaymentTerms;
  pricing: PricingBreakdown | null;
}) {
  const [state, action, pending] = useActionState(startWholesaleCheckout, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="email" value={email} />
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Full name
        <input
          name="fullName"
          required
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-[var(--scale-sm)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Address
        <input
          name="line1"
          required
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-[var(--scale-sm)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Address line 2
        <input
          name="line2"
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-[var(--scale-sm)]"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          City
          <input
            name="city"
            required
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-[var(--scale-sm)]"
          />
        </label>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          State
          <select
            name="state"
            defaultValue={jurisdiction}
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-[var(--scale-sm)]"
          >
            <option value="CA">CA</option>
            <option value="MA">MA</option>
          </select>
        </label>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Postal code
          <input
            name="postalCode"
            required
            className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-[var(--scale-sm)]"
          />
        </label>
      </div>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Payment terms
        <select
          name="paymentTerms"
          defaultValue={defaultTerms}
          className="mt-1 w-full border border-[var(--color-border)] px-3 py-2 text-[var(--scale-sm)]"
        >
          <option value="net30">NET-30 (invoice)</option>
          <option value="net60">NET-60 (invoice)</option>
          <option value="upfront">Pay upfront (Bitcoin)</option>
        </select>
      </label>
      <label className="flex items-start gap-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
        <input type="checkbox" name="confirmAge" className="mt-1" required />
        I confirm I am 21+ and authorized to purchase for this business.
      </label>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !pricing}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Placing order…" : "Place wholesale order"}
      </button>
    </form>
  );
}
