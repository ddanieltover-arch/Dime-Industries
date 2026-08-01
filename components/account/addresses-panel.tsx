// components/account/addresses-panel.tsx
"use client";

import { useActionState } from "react";
import {
  addAccountAddress,
  removeAccountAddress,
  setDefaultAccountAddress,
  type AccountActionState,
} from "@/app/(account)/actions";
import type { AccountAddress } from "@/lib/account/prefs";

const initial: AccountActionState = {};

export function AddressesPanel({ addresses }: { addresses: AccountAddress[] }) {
  const [addState, addAction, addPending] = useActionState(addAccountAddress, initial);
  const [removeState, removeAction] = useActionState(removeAccountAddress, initial);
  const [defaultState, defaultAction] = useActionState(setDefaultAccountAddress, initial);

  return (
    <div className="space-y-10">
      <ul className="space-y-3" role="list">
        {addresses.length === 0 ? (
          <li className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">No saved addresses yet.</li>
        ) : (
          addresses.map((address) => (
            <li
              key={address.id}
              className="flex flex-wrap items-start justify-between gap-3 bg-[var(--color-surface)] p-5"
            >
              <div>
                <p className="font-[var(--font-display)] uppercase tracking-[0.04em] text-[var(--color-ink)]">
                  {address.label}
                  {address.isDefault ? (
                    <span className="ml-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
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
              <div className="flex flex-col items-end gap-2">
                {!address.isDefault ? (
                  <form action={defaultAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <button
                      type="submit"
                      className="nav-link text-[var(--color-resin)] hover:text-[var(--color-resin-hover)]"
                    >
                      Make default
                    </button>
                  </form>
                ) : null}
                <form action={removeAction}>
                  <input type="hidden" name="addressId" value={address.id} />
                  <button
                    type="submit"
                    className="nav-link text-[var(--color-ink-muted)] hover:text-[var(--color-flag)]"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>

      {(defaultState.success || defaultState.error) && (
        <p
          role={defaultState.error ? "alert" : "status"}
          className={`text-[var(--scale-sm)] ${defaultState.error ? "text-[var(--color-flag)]" : "text-[var(--color-resin)]"}`}
        >
          {defaultState.error ?? defaultState.message}
        </p>
      )}

      <form action={addAction} className="max-w-lg space-y-3 border-t border-[var(--color-border)] pt-8">
        <h3 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
          Add address
        </h3>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Label
          <input name="label" required placeholder="Home" className="field-input mt-1.5" />
        </label>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Street
          <input name="line1" required className="field-input mt-1.5" />
        </label>
        <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
          Apt (optional)
          <input name="line2" className="field-input mt-1.5" />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            City
            <input name="city" required className="field-input mt-1.5" />
          </label>
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            State
            <select name="state" required defaultValue="CA" className="field-input mt-1.5">
              <option value="CA">CA</option>
              <option value="MA">MA</option>
            </select>
          </label>
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            ZIP
            <input name="postalCode" required className="field-input mt-1.5" />
          </label>
        </div>
        <label className="flex items-center gap-3 text-[var(--scale-sm)] text-[var(--color-ink)]">
          <input type="checkbox" name="isDefault" className="accent-[var(--color-resin)]" />
          Set as default
        </label>
        {addState.error ? (
          <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
            {addState.error}
          </p>
        ) : null}
        {addState.fieldErrors ? (
          <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
            Check address fields and try again.
          </p>
        ) : null}
        {addState.success || removeState.success ? (
          <p role="status" className="text-[var(--scale-sm)] text-[var(--color-resin)]">
            {addState.message ?? removeState.message}
          </p>
        ) : null}
        <button type="submit" disabled={addPending} className="btn-primary">
          {addPending ? "Saving…" : "Save address"}
        </button>
      </form>
    </div>
  );
}
