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
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p role="alert" className="mt-1 text-[var(--scale-xs)] text-[var(--color-flag)]">
      {errors[0]}
    </p>
  );
}

export function CheckoutForm({ jurisdiction, pricing, defaultEmail }: Props) {
  const [state, formAction, pending] = useActionState(startCheckout, initial);

  return (
    <form action={formAction} className="space-y-8">
      <section aria-labelledby="contact-heading" className="space-y-4">
        <h2 id="contact-heading" className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
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
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
          <FieldError errors={state.fieldErrors?.email} />
        </label>
      </section>

      <section aria-labelledby="shipping-heading" className="space-y-4">
        <h2 id="shipping-heading" className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Shipping
        </h2>
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Must ship within your verified jurisdiction: <strong className="text-[var(--color-ink)]">{jurisdiction}</strong>
        </p>

        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Full name
          <input
            name="fullName"
            required
            autoComplete="name"
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
          <FieldError errors={state.fieldErrors?.fullName} />
        </label>

        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Address
          <input
            name="line1"
            required
            autoComplete="address-line1"
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
          <FieldError errors={state.fieldErrors?.line1} />
        </label>

        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Apt / suite (optional)
          <input
            name="line2"
            autoComplete="address-line2"
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)] sm:col-span-1">
            City
            <input
              name="city"
              required
              autoComplete="address-level2"
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
            />
            <FieldError errors={state.fieldErrors?.city} />
          </label>

          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            State
            <select
              name="state"
              required
              defaultValue={jurisdiction}
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
            >
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
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
            />
            <FieldError errors={state.fieldErrors?.postalCode} />
          </label>
        </div>
      </section>

      <section aria-labelledby="payment-heading" className="space-y-4">
        <h2 id="payment-heading" className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Payment
        </h2>
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Pay with Bitcoin via Paybis. You will be redirected to complete the crypto payment.
        </p>

        <aside className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="font-[var(--font-display)] text-[var(--scale-base)] text-[var(--color-ink)]">
            Order summary
          </h3>
          <dl className="mt-3 space-y-2 text-[var(--scale-sm)]">
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">Subtotal</dt>
              <dd className="text-[var(--color-ink)]">{formatPrice(pricing.subtotalCents)}</dd>
            </div>
            {pricing.discountCents > 0 ? (
              <div className="flex justify-between">
                <dt className="text-[var(--color-terp)]">
                  {pricing.discountLabel ?? "Discount"}
                </dt>
                <dd className="text-[var(--color-terp)]">
                  −{formatPrice(pricing.discountCents)}
                </dd>
              </div>
            ) : null}
            {pricing.loyaltyDiscountCents > 0 ? (
              <div className="flex justify-between">
                <dt className="text-[var(--color-terp)]">
                  Loyalty ({pricing.loyaltyPointsRedeemed} pts)
                </dt>
                <dd className="text-[var(--color-terp)]">
                  −{formatPrice(pricing.loyaltyDiscountCents)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">{pricing.taxLabel}</dt>
              <dd className="text-[var(--color-ink)]">{formatPrice(pricing.taxCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-soft)]">{pricing.shippingLabel}</dt>
              <dd className="text-[var(--color-ink)]">{formatPrice(pricing.shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-[var(--font-display)] text-[var(--scale-base)]">
              <dt className="text-[var(--color-ink)]">Total</dt>
              <dd className="text-[var(--color-ink)]">{formatPrice(pricing.totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            No hidden fees. Every charge is shown before you pay.
          </p>
        </aside>

        <label className="flex items-start gap-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
          <input
            type="checkbox"
            name="confirmAge"
            className="mt-1"
            required
          />
          <span>I confirm I am 21 years of age or older and the shipping address is accurate.</span>
        </label>
        <FieldError errors={state.fieldErrors?.confirmAge} />
      </section>

      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)] disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Starting payment…" : "Pay with Bitcoin"}
      </button>
    </form>
  );
}
