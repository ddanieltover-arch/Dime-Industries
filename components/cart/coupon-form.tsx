// components/cart/coupon-form.tsx
"use client";

import { useActionState } from "react";
import { applyCoupon, removeCoupon, type CouponActionState } from "@/app/(commerce)/coupon-actions";

const initial: CouponActionState = {};

export function CouponForm({ appliedCode }: { appliedCode: string | null }) {
  const [state, action, pending] = useActionState(applyCoupon, initial);

  if (appliedCode) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-[var(--scale-sm)]">
        <p className="text-[var(--color-terp)]">Coupon {appliedCode} applied</p>
        <form action={removeCoupon}>
          <button type="submit" className="text-[var(--color-ink-soft)] underline-offset-4 hover:underline">
            Remove
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-wrap gap-2">
      <label className="sr-only" htmlFor="coupon-code">
        Coupon code
      </label>
      <input
        id="coupon-code"
        name="code"
        placeholder="Coupon code"
        className="min-w-[8rem] flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)] disabled:opacity-60"
      >
        {pending ? "…" : "Apply"}
      </button>
      {state.error ? (
        <p role="alert" className="w-full text-[var(--scale-xs)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="w-full text-[var(--scale-xs)] text-[var(--color-terp)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
