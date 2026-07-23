// components/wholesale/apply-form.tsx
"use client";

import { useActionState } from "react";
import { submitWholesaleApplication, type WholesaleActionState } from "@/app/(commerce)/wholesale-actions";

const initial: WholesaleActionState = {};

export function WholesaleApplyForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(submitWholesaleApplication, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Business email
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          className="mt-1 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--scale-sm)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Business name
        <input
          name="businessName"
          required
          minLength={2}
          className="mt-1 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--scale-sm)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        License / resale number
        <input
          name="licenseNumber"
          className="mt-1 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--scale-sm)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Resale certificate URL (optional)
        <input
          name="resaleCertUrl"
          type="url"
          placeholder="https://"
          className="mt-1 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--scale-sm)]"
        />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Preferred terms
        <select
          name="preferredTerms"
          defaultValue="net30"
          className="mt-1 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--scale-sm)]"
        >
          <option value="net30">NET-30</option>
          <option value="net60">NET-60</option>
          <option value="upfront">Pay upfront (Bitcoin)</option>
        </select>
      </label>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-[var(--scale-sm)] text-[var(--color-terp)]">{state.success}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-2 text-[var(--scale-sm)] text-[var(--color-surface)] disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
