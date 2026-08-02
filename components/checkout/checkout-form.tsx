// components/checkout/checkout-form.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import {
  startCheckout,
  type CheckoutActionState,
} from "@/app/(commerce)/checkout-actions";
import type { LaunchJurisdiction } from "@/lib/compliance/jurisdictions";
import type { PricingBreakdown } from "@/lib/checkout/pricing";
import { formatPrice } from "@/lib/format";
import {
  MANUAL_PAYMENT_METHODS,
  MANUAL_PAYMENT_MIN_TOTAL_CENTS,
  PAYMENT_METHOD_LABELS,
  manualPaymentHint,
  manualPaymentsAvailable,
  type ManualPaymentHandles,
  type ManualPaymentMethod,
  type RetailPaymentMethod,
} from "@/lib/payments/methods";

const initial: CheckoutActionState = {};

type Props = {
  jurisdiction: LaunchJurisdiction;
  pricing: PricingBreakdown;
  defaultEmail?: string;
  defaultPhone?: string;
  manualHandles?: ManualPaymentHandles;
  defaults?: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
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

export function CheckoutForm({
  jurisdiction,
  pricing,
  defaultEmail,
  defaultPhone,
  manualHandles = {},
  defaults,
}: Props) {
  const [state, formAction, pending] = useActionState(startCheckout, initial);
  const [method, setMethod] = useState<RetailPaymentMethod>("paybis_btc");
  const showManualMethods = manualPaymentsAvailable(pricing.totalCents);
  const isBitcoin = method === "paybis_btc";
  const manualMethod =
    showManualMethods && !isBitcoin ? (method as ManualPaymentMethod) : null;
  const handle = manualMethod ? manualHandles[manualMethod] : undefined;

  useEffect(() => {
    if (!showManualMethods && method !== "paybis_btc") {
      setMethod("paybis_btc");
    }
  }, [showManualMethods, method]);

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
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Phone
          <input
            type="tel"
            name="phone"
            required
            defaultValue={defaultPhone}
            autoComplete="tel"
            className={fieldClass}
          />
          <FieldError errors={state.fieldErrors?.phone} />
        </label>
      </section>

      <section aria-labelledby="shipping-heading" className="space-y-4">
        <h2
          id="shipping-heading"
          className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
        >
          Shipping
        </h2>

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
            <input
              name="state"
              required
              autoComplete="address-level1"
              defaultValue={defaults?.state ?? ""}
              placeholder="State"
              className={fieldClass}
            />
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

        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Country
          <select name="country" required defaultValue="US" autoComplete="country" className={fieldClass}>
            <option value="US">United States</option>
          </select>
          <FieldError errors={state.fieldErrors?.country} />
        </label>
      </section>

      <section aria-labelledby="payment-heading" className="space-y-5">
        <h2
          id="payment-heading"
          className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]"
        >
          Payment
        </h2>

        <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
          Total due:{" "}
          <span className="text-[var(--color-resin)]">{formatPrice(pricing.totalCents)}</span>
        </p>

        <fieldset className="space-y-3">
          <legend className="sr-only">Payment method</legend>

          {showManualMethods ? (
            <label
              className={`relative flex cursor-pointer flex-col gap-2 border px-5 py-5 transition ${
                isBitcoin
                  ? "border-[var(--color-resin)] bg-[rgba(201,177,56,0.08)] shadow-[0_0_0_1px_var(--color-resin)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-interactive)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paybis_btc"
                  checked={isBitcoin}
                  onChange={() => setMethod("paybis_btc")}
                  className="mt-1 accent-[var(--color-resin)]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.1em] text-[var(--color-ink)]">
                      Pay with Bitcoin
                    </span>
                    <span className="font-[var(--font-display)] text-[9px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-1.5 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                    You’ll get our Bitcoin wallet and Paybis card-to-BTC steps on the next screen.
                  </p>
                </div>
              </div>
            </label>
          ) : (
            <div className="border border-[var(--color-resin)] bg-[rgba(201,177,56,0.08)] px-5 py-5 shadow-[0_0_0_1px_var(--color-resin)]">
              <input type="hidden" name="paymentMethod" value="paybis_btc" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.1em] text-[var(--color-ink)]">
                  Pay with Bitcoin
                </span>
              </div>
              <p className="mt-1.5 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                Next you’ll see our Bitcoin wallet and how to pay by card via Paybis. Manual payment
                options unlock at {formatPrice(MANUAL_PAYMENT_MIN_TOTAL_CENTS)}+.
              </p>
            </div>
          )}

          {showManualMethods ? (
            <div>
              <p className="mb-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                Or pay manually
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MANUAL_PAYMENT_METHODS.map((id) => {
                  const selected = method === id;
                  return (
                    <label
                      key={id}
                      className={`flex cursor-pointer items-center gap-3 border px-4 py-3 transition ${
                        selected
                          ? "border-[var(--color-resin)] bg-[rgba(201,177,56,0.06)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-interactive)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={id}
                        checked={selected}
                        onChange={() => setMethod(id)}
                        className="accent-[var(--color-resin)]"
                      />
                      <span className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.12em] text-[var(--color-ink)]">
                        {PAYMENT_METHOD_LABELS[id]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
          <FieldError errors={state.fieldErrors?.paymentMethod} />
        </fieldset>

        {manualMethod ? (
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            <p>{manualPaymentHint(manualMethod)}</p>
            {handle ? (
              <p className="mt-2 text-[var(--color-ink)]">
                Send to{" "}
                <span className="font-[var(--font-display)] tracking-[0.04em] text-[var(--color-resin)]">
                  {handle}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-[var(--color-ink-muted)]">
                Payment details appear on the next screen after you place the order.
              </p>
            )}
            <p className="mt-2 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              Your order stays pending until we confirm the transfer.
            </p>
          </div>
        ) : null}

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

      <button
        type="submit"
        disabled={pending}
        className={isBitcoin ? "btn-primary w-full text-[var(--scale-sm)] py-4" : "btn-outline w-full"}
      >
        {pending
          ? isBitcoin
            ? "Creating order…"
            : "Placing order…"
          : isBitcoin
            ? "Pay with Bitcoin"
            : `Place order — pay with ${PAYMENT_METHOD_LABELS[method]}`}
      </button>
    </form>
  );
}
