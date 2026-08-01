// components/consent/cookie-prefs-form.tsx
"use client";

import { useActionState } from "react";
import {
  saveCookiePrefsAction,
  type ConsentActionState,
} from "@/app/(consent)/actions";
import type { CookieConsent } from "@/lib/consent/logic";

const initial: ConsentActionState = {};

export function CookiePrefsForm({ consent }: { consent: CookieConsent }) {
  const [state, action, pending] = useActionState(saveCookiePrefsAction, initial);

  return (
    <form action={action} className="max-w-md space-y-4">
      <label className="flex items-start gap-3 text-[var(--scale-sm)] text-[var(--color-ink)]">
        <input type="checkbox" checked disabled className="mt-1 accent-[var(--color-resin)]" />
        <span>
          <span className="text-[var(--color-ink)]">Necessary</span>
          <span className="mt-0.5 block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Required for cart, age gate, security, and account sessions. Always on.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-[var(--scale-sm)] text-[var(--color-ink)]">
        <input
          type="checkbox"
          name="analytics"
          defaultChecked={consent.analytics}
          className="mt-1 accent-[var(--color-resin)]"
        />
        <span>
          Analytics
          <span className="mt-0.5 block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Helps us understand storefront performance (e.g. Sentry / traffic metrics).
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-[var(--scale-sm)] text-[var(--color-ink)]">
        <input
          type="checkbox"
          name="marketing"
          defaultChecked={consent.marketing}
          className="mt-1 accent-[var(--color-resin)]"
        />
        <span>
          Marketing
          <span className="mt-0.5 block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Personalized offers and campaign measurement.
          </span>
        </span>
      </label>
      {state.success ? (
        <p role="status" className="text-[var(--scale-sm)] text-[var(--color-resin)]">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save cookie preferences"}
      </button>
    </form>
  );
}
