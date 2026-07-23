// components/admin/wholesale-panel.tsx
"use client";

import { useActionState } from "react";
import {
  adminReviewWholesale,
  adminSetWholesalePrice,
  type WholesaleActionState,
} from "@/app/(commerce)/wholesale-actions";
import type { WholesaleAccount } from "@/lib/wholesale/types";
import { termsLabel } from "@/lib/wholesale/pricing";

const initial: WholesaleActionState = {};

export function AdminWholesalePanel({ accounts }: { accounts: WholesaleAccount[] }) {
  const [state, action, pending] = useActionState(adminReviewWholesale, initial);

  return (
    <div className="mt-4 space-y-4">
      {accounts.length === 0 ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No applications yet.</p>
      ) : (
        accounts.map((account) => (
          <div
            key={account.email}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[var(--color-ink)]">{account.businessName}</p>
                <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  {account.email} · {account.status} · preferred{" "}
                  {termsLabel(account.defaultPaymentTerms)}
                </p>
                {account.licenseNumber ? (
                  <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    License: {account.licenseNumber}
                  </p>
                ) : null}
              </div>
              {account.status === "pending" ? (
                <form action={action} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="email" value={account.email} />
                  <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                    Terms
                    <select
                      name="defaultPaymentTerms"
                      defaultValue={account.defaultPaymentTerms}
                      className="mt-1 block border border-[var(--color-border)] px-2 py-1"
                    >
                      <option value="net30">NET-30</option>
                      <option value="net60">NET-60</option>
                      <option value="upfront">Upfront</option>
                    </select>
                  </label>
                  <input
                    name="notes"
                    placeholder="Notes"
                    className="border border-[var(--color-border)] px-2 py-1 text-[var(--scale-sm)]"
                  />
                  <button
                    type="submit"
                    name="decision"
                    value="approved"
                    disabled={pending}
                    className="border border-[var(--color-border)] px-3 py-1 text-[var(--scale-sm)]"
                  >
                    Approve
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="rejected"
                    disabled={pending}
                    className="border border-[var(--color-flag)] px-3 py-1 text-[var(--scale-sm)] text-[var(--color-flag)]"
                  >
                    Reject
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))
      )}
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-terp)]">{state.success}</p>
      ) : null}
    </div>
  );
}

export function AdminWholesalePriceForm({
  variants,
}: {
  variants: { variantId: string; label: string; priceDollars: string; moq: number }[];
}) {
  const [state, action, pending] = useActionState(adminSetWholesalePrice, initial);
  const first = variants[0];

  return (
    <form action={action} className="mt-6 flex flex-wrap items-end gap-3 border-t border-[var(--color-border)] pt-6">
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Variant
        <select
          name="variantId"
          defaultValue={first?.variantId}
          className="mt-1 block max-w-md border border-[var(--color-border)] px-2 py-1 text-[var(--scale-sm)]"
        >
          {variants.map((v) => (
            <option key={v.variantId} value={v.variantId}>
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Wholesale $
        <input
          name="priceDollars"
          type="number"
          step="0.01"
          min="0"
          defaultValue={first?.priceDollars}
          className="mt-1 block w-28 border border-[var(--color-border)] px-2 py-1"
        />
      </label>
      <label className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        MOQ
        <input
          name="minQuantity"
          type="number"
          min="1"
          defaultValue={first?.moq ?? 5}
          className="mt-1 block w-20 border border-[var(--color-border)] px-2 py-1"
        />
      </label>
      <button
        type="submit"
        disabled={pending || !first}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save override"}
      </button>
      {state.error ? (
        <p role="alert" className="w-full text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="w-full text-[var(--scale-sm)] text-[var(--color-terp)]">{state.success}</p>
      ) : null}
    </form>
  );
}
