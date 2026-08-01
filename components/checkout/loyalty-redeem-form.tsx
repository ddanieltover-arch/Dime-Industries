// components/checkout/loyalty-redeem-form.tsx
"use client";

import { useActionState } from "react";
import {
  setLoyaltyRedeemPointsAction,
  type CheckoutActionState,
} from "@/app/(commerce)/checkout-actions";
import { formatPrice } from "@/lib/format";

const initial: CheckoutActionState = {};

export function LoyaltyRedeemForm({
  balance,
  appliedPoints,
  appliedDiscountCents,
}: {
  balance: number;
  appliedPoints: number;
  appliedDiscountCents: number;
}) {
  const [state, action, pending] = useActionState(setLoyaltyRedeemPointsAction, initial);

  if (balance < 100) {
    return (
      <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Earn 100+ loyalty points to redeem at checkout (100 pts = $1).
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Balance: {balance} pts
        {appliedPoints > 0
          ? ` · applying ${appliedPoints} pts (−${formatPrice(appliedDiscountCents)})`
          : null}
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="number"
          name="points"
          min={0}
          step={100}
          max={balance}
          defaultValue={appliedPoints || ""}
          placeholder="Points to redeem"
          className="field-input w-40"
        />
        <button type="submit" disabled={pending} className="btn-outline px-5 py-3">
          {pending ? "Updating…" : "Apply points"}
        </button>
        {appliedPoints > 0 ? (
          <button
            type="submit"
            name="points"
            value="0"
            disabled={pending}
            className="nav-link self-center text-[var(--color-ink-muted)]"
          >
            Clear
          </button>
        ) : null}
      </div>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
