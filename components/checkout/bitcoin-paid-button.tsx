"use client";

import { useActionState } from "react";
import {
  reportBitcoinPayment,
  type ReportPaymentState,
} from "@/app/(commerce)/checkout-actions";

const initial: ReportPaymentState = {};

export function BitcoinPaidButton({ orderId }: { orderId: string }) {
  const action = reportBitcoinPayment.bind(null, orderId);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-3">
      <button type="submit" disabled={pending} className="btn-primary w-full py-4 text-[var(--scale-sm)]">
        {pending ? "Notifying…" : "I have paid"}
      </button>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      <p className="text-center text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
        This notifies our team to verify your Bitcoin transfer. Orders are approved manually.
      </p>
    </form>
  );
}
