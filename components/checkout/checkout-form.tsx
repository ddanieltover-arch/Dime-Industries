// components/checkout/checkout-form.tsx
"use client";

import { useActionState } from "react";
import {
  startCheckout,
  type CheckoutActionState,
} from "@/app/(commerce)/checkout-actions";
import type { LaunchJurisdiction } from "@/lib/compliance/jurisdictions";
import type { PricingBreakdown } from "@/lib/checkout/pricing";
import { formatPrice } from "@/lib/format";

const initial: CheckoutActionState = {};

type Props = {
  jurisdiction: LaunchJurisdiction;
  pricing: PricingBreakdown;
  defaultEmail?: string;
  defaults?: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: LaunchJurisdiction;
    postalCode?: string;
  };
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p role="alert" className="mt-1 text-[var(--scale-xs)] text-[var(--color-flag)]">
      {errors[0]}
    </p>
  );
}

const fieldClass =
  "mt-1.5 w-full rounded-[var(--radius-pill)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-ink)]";

export function CheckoutForm({ jurisdiction, pricing, defaultEmail, defaults }: Props) {
  const [state, formAction, pending] = useActionState(startCheckout, initial);
  const shipState = defaults?.state ?? jurisdiction;

  return (
    <form action={formAction} className="space-y-10">
      <section aria-labelledby="contact-heading" className="space-y-4">
        <h2
          id="contact-heading"
          className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
        >
          Contact
        </h2>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Email
          <input
            type="email"
            name="email"
            required
            defaultValue={defaultEmail}
            autoComplete="email"
            className={fieldClass}
          />
          <FieldError errors={state.fieldErrors?.email} />
        </label>
      </section>

      <section aria-labelledby="shipping-heading" className="space-y-4">
        <h2
          id="shipping-heading"
          className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
        >
          Shipping
        </h2>
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Delivery available in California and Massachusetts only.
        </p>

        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Full name
          <input
            name="fullName"
            required
            autoComplete="name"
            defaultValue={defaults?.fullName}
            className={fieldClass}
          />
          <FieldError errors={state.fieldErrors?.fullName} />
        </label>

        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Address
          <input
            name="line1"
            required
            autoComplete="address-line1"
            defaultValue={defaults?.line1}
            className={fieldClass}
          />
          <FieldError errors={state.fieldErrors?.line1} />
        </label>

        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Apt / suite (optional)
          <input
            name="line2"
            autoComplete="address-line2"
            defaultValue={defaults?.line2}
            className={fieldClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)] sm:col-span-1">
            City
            <input
              name="city"
              required
              autoComplete="address-level2"
              defaultValue={defaults?.city}
              className={fieldClass}
            />
            <FieldError errors={state.fieldErrors?.city} />
          </label>

          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            State
            <select name="state" required defaultValue={shipState} className={fieldClass}>
              <option value="CA">California</option>
              <option value="MA">Massachusetts</option>
            </select>
            <FieldError errors={state.fieldErrors?.state} />
          </label>

          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            ZIP
            <input
              name="postalCode"
              required
              autoComplete="postal-code"
              defaultValue={defaults?.postalCode}
              className={fieldClass}
            />
            <FieldError errors={state.fieldErrors?.postalCode} />
          </label>
        </div>
      </section>

      <section aria-labelledby="payment-heading" className="space-y-4">
        <h2
          id="payment-heading"
          className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
        >
          Payment
        </h2>
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Pay with Bitcoin via Paybis. You will be redirected to complete the crypto payment.
        </p>

        <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
          Full totals — including tax and shipping — appear in the order summary beside this form.
          Total due:{" "}
          <span className="text-[var(--color-resin)]">{formatPrice(pricing.totalCents)}</span>
        </p>

        <label className="flex items-start gap-3 text-[var(--scale-sm)] text-[var(--color-ink)]">
          <input type="checkbox" name="confirmAge" className="mt-1 accent-[var(--color-resin)]" required />
          <span>I confirm I am 21 years of age or older and the shipping address is accurate.</span>
        </label>
        <FieldError errors={state.fieldErrors?.confirmAge} />
      </section>

      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Starting payment…" : "Pay with Bitcoin"}
      </button>
    </form>
  );
}
