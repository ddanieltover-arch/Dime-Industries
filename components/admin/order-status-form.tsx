// components/admin/order-status-form.tsx
"use client";

import { useActionState } from "react";
import { updateAdminOrderStatus, type AdminActionState } from "@/app/(admin)/actions";

const initial: AdminActionState = {};

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [state, action, pending] = useActionState(updateAdminOrderStatus, initial);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        defaultValue={status}
        className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-2 py-1 text-[var(--scale-sm)]"
      >
        <option value="pending">pending</option>
        <option value="payment_confirmed">payment_confirmed</option>
        <option value="cancelled">cancelled</option>
        <option value="rejected">rejected</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="text-[var(--scale-xs)] text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
      >
        Update
      </button>
      {state.message ? <span className="text-[var(--scale-xs)] text-[var(--color-terp)]">{state.message}</span> : null}
      {state.error ? <span className="text-[var(--scale-xs)] text-[var(--color-flag)]">{state.error}</span> : null}
    </form>
  );
}
