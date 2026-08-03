// components/wholesale/apply-form.tsx
"use client";

import { useActionState, useCallback } from "react";
import { submitWholesaleApplication, type WholesaleActionState } from "@/app/(commerce)/wholesale-actions";
import { GaSuccessEffect } from "@/components/analytics/ga-success-effect";
import { trackGenerateLead } from "@/lib/analytics/track";

const initial: WholesaleActionState = {};

export function WholesaleApplyForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(submitWholesaleApplication, initial);
  const onLead = useCallback(() => trackGenerateLead("wholesale_apply"), []);

  return (
    <form action={action} className="space-y-4">
      <GaSuccessEffect ready={Boolean(state.success)} onSuccess={onLead} />
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Business email
        <input name="email" type="email" required defaultValue={defaultEmail} className="field-input mt-1.5" />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Business name
        <input name="businessName" required minLength={2} className="field-input mt-1.5" />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        License / resale number
        <input name="licenseNumber" className="field-input mt-1.5" />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Resale certificate URL (optional)
        <input name="resaleCertUrl" type="url" placeholder="https://" className="field-input mt-1.5" />
      </label>
      <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Preferred terms
        <select name="preferredTerms" defaultValue="net30" className="field-input mt-1.5">
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
        <p className="text-[var(--scale-sm)] text-[var(--color-resin)]">{state.success}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
