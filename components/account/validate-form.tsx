// components/account/validate-form.tsx
"use client";

import { useActionState } from "react";
import {
  submitProductValidation,
  type AccountActionState,
} from "@/app/(account)/actions";

const initial: AccountActionState = {};

export function ValidateForm() {
  const [state, formAction, pending] = useActionState(submitProductValidation, initial);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Validation code
        <input
          name="code"
          required
          placeholder="e.g. LR-GELATO-1G or LR-GELATO-1G-AB12"
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 font-[var(--font-mono)] text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Scratch the code on your package, or enter the product SKU from a licensed purchase.
      </p>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-[var(--scale-sm)] text-[var(--color-terp)]">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-2 text-[var(--scale-sm)] text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
      >
        {pending ? "Checking…" : "Validate product"}
      </button>
    </form>
  );
}
