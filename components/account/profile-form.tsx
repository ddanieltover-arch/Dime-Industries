// components/account/profile-form.tsx
"use client";

import { useActionState } from "react";
import {
  updateAccountProfile,
  type AccountActionState,
} from "@/app/(account)/actions";

const initial: AccountActionState = {};

export function ProfileForm({
  displayName,
  phone,
  email,
}: {
  displayName: string;
  phone: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(updateAccountProfile, initial);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Signed in as <span className="text-[var(--color-ink)]">{email}</span>
      </p>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Display name
        <input name="displayName" defaultValue={displayName} className="field-input mt-1.5" />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Phone
        <input name="phone" defaultValue={phone} autoComplete="tel" className="field-input mt-1.5" />
      </label>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-[var(--scale-sm)] text-[var(--color-resin)]">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
