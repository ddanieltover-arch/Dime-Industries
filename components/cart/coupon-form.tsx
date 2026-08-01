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
        <p className="text-[var(--color-resin)]">Coupon {appliedCode} applied</p>
        <form action={removeCoupon}>
          <button type="submit" className="nav-link text-[var(--color-ink-muted)] hover:text-[var(--color-flag)]">
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
        className="field-input min-w-[8rem] flex-1"
      />
      <button type="submit" disabled={pending} className="btn-outline shrink-0 px-5 py-3">
        {pending ? "…" : "Apply"}
      </button>
      {state.error ? (
        <p role="alert" className="w-full text-[var(--scale-xs)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="w-full text-[var(--scale-xs)] text-[var(--color-resin)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
