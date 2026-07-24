// components/shared/age-gate-dialog.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { confirmAgeGate, type AgeGateActionState } from "@/app/(compliance)/actions";
import { LAUNCH_JURISDICTIONS } from "@/lib/compliance/jurisdictions";

const initialState: AgeGateActionState = {};

/**
 * Full-page age gate rendered in the document flow (not a portal overlay).
 * Success does a hard navigation so cookies + RSC stay in sync.
 */
export function AgeGateDialog({ initiallyOpen }: { initiallyOpen: boolean }) {
  const [state, formAction, pending] = useActionState(confirmAgeGate, initialState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gateSucceeded = Boolean(state.success);

  useEffect(() => {
    if (!gateSucceeded) return;
    // Hard reload picks up httpOnly age cookies reliably (router.refresh can
    // leave the client on a stale tree and trip the error boundary).
    window.location.replace(window.location.pathname);
  }, [gateSucceeded]);

  useEffect(() => {
    if (initiallyOpen && !gateSucceeded) headingRef.current?.focus();
  }, [initiallyOpen, gateSucceeded, state.needsJurisdiction, state.notAvailable]);

  if (!initiallyOpen) return null;

  if (gateSucceeded) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-black px-6 text-center">
        <p className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] text-[var(--color-resin)]">
          Entering DIME…
        </p>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-description"
      className="flex min-h-[70vh] items-center justify-center bg-black px-6 py-16"
    >
      <div className="w-full max-w-lg text-center">
        <div className="relative mx-auto mb-8 h-12 w-40">
          <Image src="/brand/logo.png" alt="DIME" fill className="object-contain" sizes="160px" priority />
        </div>

        <h1
          id="age-gate-title"
          ref={headingRef}
          tabIndex={-1}
          className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-white outline-none sm:text-[var(--scale-3xl)]"
        >
          {state.notAvailable ? "Not yet available" : "Are you over 21?"}
        </h1>

        <p
          id="age-gate-description"
          className="mx-auto mt-4 max-w-md text-[var(--scale-sm)] leading-relaxed text-white/70"
        >
          {state.notAvailable
            ? "DIME currently serves California and Massachusetts only. We're not able to show pricing or products outside those states."
            : "By clicking Yes and entering DIME Industries' site, I confirm I'm at least 21 or a qualified patient, and I agree to the Terms of Service and Privacy Policy."}
        </p>

        {!state.notAvailable && (
          <form action={formAction} className="mt-10 space-y-4">
            {state.needsJurisdiction && (
              <div className="mx-auto max-w-xs text-left">
                <label
                  htmlFor="jurisdiction"
                  className="block font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-resin)]"
                >
                  Which state are you in?
                </label>
                <select
                  id="jurisdiction"
                  name="jurisdiction"
                  required
                  defaultValue=""
                  className="mt-2 w-full rounded-full border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)]"
                >
                  <option value="" disabled>
                    Select a state
                  </option>
                  {LAUNCH_JURISDICTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j === "CA" ? "California" : "Massachusetts"}
                    </option>
                  ))}
                  <option value="OTHER">Other / not listed</option>
                </select>
                <input type="hidden" name="isOfAge" value="yes" />
              </div>
            )}

            {state.error && (
              <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
                {state.error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {!state.needsJurisdiction && (
                <button
                  type="submit"
                  name="isOfAge"
                  value="no"
                  formNoValidate
                  className="min-w-[7.5rem] rounded-full border border-white/40 px-8 py-3 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] text-white transition-colors hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
                >
                  No
                </button>
              )}
              <button
                type="submit"
                name="isOfAge"
                value="yes"
                disabled={pending}
                className="min-w-[7.5rem] rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] text-black transition-colors hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
              >
                {pending ? "Checking…" : state.needsJurisdiction ? "Continue" : "Yes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
