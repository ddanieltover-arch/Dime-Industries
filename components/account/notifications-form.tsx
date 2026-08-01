// components/account/notifications-form.tsx
"use client";

import { useActionState } from "react";
import {
  updateNotificationPrefs,
  type AccountActionState,
} from "@/app/(account)/actions";

const initial: AccountActionState = {};

export function NotificationsForm({
  orderUpdates,
  marketing,
  productAlerts,
}: {
  orderUpdates: boolean;
  marketing: boolean;
  productAlerts: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateNotificationPrefs, initial);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {(
        [
          ["orderUpdates", "Order updates", orderUpdates],
          ["marketing", "Marketing & promotions", marketing],
          ["productAlerts", "Product & drop alerts", productAlerts],
        ] as const
      ).map(([name, label, checked]) => (
        <label key={name} className="flex items-start gap-3 text-[var(--scale-sm)] text-[var(--color-ink)]">
          <input
            type="checkbox"
            name={name}
            defaultChecked={checked}
            className="mt-1 accent-[var(--color-resin)]"
          />
          <span>{label}</span>
        </label>
      ))}
      {state.success ? (
        <p role="status" className="text-[var(--scale-sm)] text-[var(--color-resin)]">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
