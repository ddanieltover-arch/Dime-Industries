// components/checkout/checkout-workspace.tsx
"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import type { CartLine } from "@/lib/cart/types";
import type { AppliedCoupon } from "@/lib/coupons/types";
import { computePricing } from "@/lib/checkout/pricing";
import { defaultSubdivisionForCountry } from "@/lib/checkout/subdivisions";
import { formatPrice } from "@/lib/format";
import type { ManualPaymentHandles } from "@/lib/payments/methods";

const BeginCheckoutEvent = dynamic(
  () =>
    import("@/components/analytics/begin-checkout-event").then(
      (m) => m.BeginCheckoutEvent,
    ),
  { ssr: false },
);

type Props = {
  lines: CartLine[];
  coupon: AppliedCoupon | null;
  loyalty: { points: number; discountCents: number } | null;
  defaultEmail?: string;
  defaultPhone?: string;
  manualHandles?: ManualPaymentHandles;
  /** When false, skip begin_checkout island (no analytics consent). */
  analyticsEnabled?: boolean;
  defaults?: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentError?: boolean;
};

export function CheckoutWorkspace({
  lines,
  coupon,
  loyalty,
  defaultEmail,
  defaultPhone,
  manualHandles,
  analyticsEnabled = false,
  defaults,
  paymentError,
}: Props) {
  const initialCountry = (defaults?.country ?? "US").toUpperCase();
  const initialState = defaultSubdivisionForCountry(initialCountry, defaults?.state);

  const [shipState, setShipState] = useState(initialState);
  const [shipCountry, setShipCountry] = useState(initialCountry);

  const pricing = useMemo(
    () => computePricing(lines, { state: shipState, country: shipCountry }, coupon, loyalty),
    [lines, shipState, shipCountry, coupon, loyalty]
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-[var(--container-pad-x)] pb-[var(--section-y)] pt-6 sm:gap-10 sm:pt-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
      <div id="checkout-form" className="order-2 scroll-mt-24 lg:order-1">
        {paymentError ? (
          <p
            role="alert"
            className="mb-6 border border-[var(--color-flag)] bg-[var(--color-surface)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-flag)]"
          >
            Payment was not completed. You can try again below.
          </p>
        ) : null}

        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-7">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
            Details
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
            Shipping & payment
          </h2>
          <div className="mt-6">
            {analyticsEnabled ? (
              <BeginCheckoutEvent valueUsd={pricing.totalCents / 100} />
            ) : null}
            <CheckoutForm
              pricing={pricing}
              shipState={shipState}
              shipCountry={shipCountry}
              onShipStateChange={setShipState}
              onShipCountryChange={setShipCountry}
              defaultEmail={defaultEmail}
              defaultPhone={defaultPhone}
              manualHandles={manualHandles}
              defaults={defaults}
            />
          </div>
        </div>
      </div>

      <aside className="order-1 h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7 lg:sticky lg:top-24 lg:order-2">
        <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
          Order summary
        </p>
        <h2 className="mt-2 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)] sm:text-[var(--scale-xl)]">
          Your bag
        </h2>

        <ul className="mt-5 space-y-4" role="list">
          {lines.map((line) => (
            <li
              key={line.variantId}
              className="border-b border-[var(--color-border)] pb-4 text-[var(--scale-sm)] last:border-0 last:pb-0"
            >
              <p className="font-[var(--font-display)] uppercase tracking-[0.04em] text-[var(--color-ink)]">
                {line.productName}{" "}
                <span className="text-[var(--color-ink-soft)]">× {line.quantity}</span>
              </p>
              <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                {line.weightOrFormat} · {formatPrice(line.unitPriceCents * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2.5 border-t border-[var(--color-border)] pt-5 text-[var(--scale-sm)]">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--color-ink-soft)]">Subtotal</dt>
            <dd className="text-[var(--color-ink)]">{formatPrice(pricing.subtotalCents)}</dd>
          </div>
          {pricing.discountCents > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-terp)]">{pricing.discountLabel ?? "Discount"}</dt>
              <dd className="text-[var(--color-terp)]">−{formatPrice(pricing.discountCents)}</dd>
            </div>
          ) : null}
          {pricing.loyaltyDiscountCents > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-terp)]">
                Loyalty ({pricing.loyaltyPointsRedeemed} pts)
              </dt>
              <dd className="text-[var(--color-terp)]">
                −{formatPrice(pricing.loyaltyDiscountCents)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--color-ink-soft)]">{pricing.taxLabel}</dt>
            <dd className="text-[var(--color-ink)]">{formatPrice(pricing.taxCents)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--color-ink-soft)]">{pricing.shippingLabel}</dt>
            <dd className="text-[var(--color-ink)]">{formatPrice(pricing.shippingCents)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-[var(--color-border)] pt-4">
            <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink)]">
              Total
            </dt>
            <dd className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-resin)]">
              {formatPrice(pricing.totalCents)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
          No hidden fees. Every charge is shown before you pay.
        </p>
        <Link
          href="/cart"
          className="mt-5 inline-flex min-h-11 items-center font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-resin)]"
        >
          Edit cart →
        </Link>
      </aside>
    </div>
  );
}
