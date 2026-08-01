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
          className="field-input mt-1.5 font-[var(--font-mono)]"
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
        <p role="status" className="text-[var(--scale-sm)] text-[var(--color-resin)]">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Checking…" : "Validate product"}
      </button>
    </form>
  );
}
