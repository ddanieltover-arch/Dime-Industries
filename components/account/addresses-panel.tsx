// components/account/addresses-panel.tsx
"use client";

import { useActionState } from "react";
import {
  addAccountAddress,
  removeAccountAddress,
  type AccountActionState,
} from "@/app/(account)/actions";
import type { AccountAddress } from "@/lib/account/prefs";

const initial: AccountActionState = {};

export function AddressesPanel({ addresses }: { addresses: AccountAddress[] }) {
  const [addState, addAction, addPending] = useActionState(addAccountAddress, initial);
  const [removeState, removeAction] = useActionState(removeAccountAddress, initial);

  return (
    <div className="space-y-10">
      <ul className="space-y-3" role="list">
        {addresses.length === 0 ? (
          <li className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No saved addresses yet.</li>
        ) : (
          addresses.map((address) => (
            <li
              key={address.id}
              className="flex flex-wrap items-start justify-between gap-3 border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
            >
              <div>
                <p className="font-[var(--font-display)] text-[var(--color-ink)]">
                  {address.label}
                  {address.isDefault ? (
                    <span className="ml-2 font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
                      default
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </p>
              </div>
              <form action={removeAction}>
                <input type="hidden" name="addressId" value={address.id} />
                <button
                  type="submit"
                  className="text-[var(--scale-sm)] text-[var(--color-ink-soft)] underline-offset-4 hover:text-[var(--color-flag)] hover:underline"
                >
                  Remove
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={addAction} className="max-w-lg space-y-3 border-t border-[var(--color-border)] pt-8">
        <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
          Add address
        </h3>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Label
          <input name="label" required placeholder="Home" className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]" />
        </label>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Street
          <input name="line1" required className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]" />
        </label>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Apt (optional)
          <input name="line2" className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]" />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            City
            <input name="city" required className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]" />
          </label>
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            State
            <select name="state" required defaultValue="CA" className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
              <option value="CA">CA</option>
              <option value="MA">MA</option>
            </select>
          </label>
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            ZIP
            <input name="postalCode" required className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]" />
          </label>
        </div>
        <label className="flex items-center gap-2 text-[var(--scale-sm)] text-[var(--color-ink)]">
          <input type="checkbox" name="isDefault" />
          Set as default
        </label>
        {addState.error ? (
          <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
            {addState.error}
          </p>
        ) : null}
        {addState.success || removeState.success ? (
          <p role="status" className="text-[var(--scale-sm)] text-[var(--color-terp)]">
            {addState.message ?? removeState.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={addPending}
          className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-2 text-[var(--scale-sm)] text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
        >
          {addPending ? "Saving…" : "Save address"}
        </button>
      </form>
    </div>
  );
}
