// components/shared/age-gate-dialog.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { confirmAgeGate, type AgeGateActionState } from "@/app/(compliance)/actions";
import { LAUNCH_JURISDICTIONS } from "@/lib/compliance/jurisdictions";

const initialState: AgeGateActionState = {};

export function AgeGateDialog({ initiallyOpen }: { initiallyOpen: boolean }) {
  const [state, formAction, pending] = useActionState(confirmAgeGate, initialState);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const resolved = !state.error && !state.needsJurisdiction && !state.notAvailable && !pending;
  // Once the server action succeeds with no follow-up step, force the page's
  // Server Component to re-read the now-set cookie so the dialog actually
  // closes and the real page renders behind it.
  useEffect(() => {
    if (resolved && (state as AgeGateActionState) !== initialState) {
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const open = initiallyOpen && !resolved;

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--color-ink)]/60 backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            headingRef.current?.focus();
          }}
          onEscapeKeyDown={(e) => e.preventDefault()} // can't dismiss a legal gate with Escape
          onPointerDownOutside={(e) => e.preventDefault()}
          aria-describedby="age-gate-description"
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-8 shadow-[var(--shadow-card)]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.needsJurisdiction ? "jurisdiction" : state.notAvailable ? "unavailable" : "age"}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Dialog.Title
                ref={headingRef}
                tabIndex={-1}
                className="font-[var(--font-display)] text-[var(--scale-xl)] text-[var(--color-ink)] outline-none"
              >
                {state.notAvailable ? "Not yet available in your area" : "Age verification required"}
              </Dialog.Title>

              <Dialog.Description
                id="age-gate-description"
                className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]"
              >
                {state.notAvailable
                  ? "DIME Enterprise Commerce currently serves California and Massachusetts only. We're not able to show pricing or products outside those states."
                  : "This site sells regulated cannabis products. You must confirm you are 21 or older, or a qualifying medical patient, to continue."}
              </Dialog.Description>

              {!state.notAvailable && (
                <form action={formAction} className="mt-6 space-y-4">
                  {state.needsJurisdiction && (
                    <div>
                      <label
                        htmlFor="jurisdiction"
                        className="block text-[var(--scale-sm)] font-medium text-[var(--color-ink)]"
                      >
                        Which state are you in?
                      </label>
                      <select
                        id="jurisdiction"
                        name="jurisdiction"
                        required
                        defaultValue=""
                        className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-ink)]"
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

                  {!state.needsJurisdiction && (
                    <fieldset>
                      <legend className="text-[var(--scale-sm)] text-[var(--color-ink)]">
                        I am 21 years of age or older, or a qualifying medical patient.
                      </legend>
                    </fieldset>
                  )}

                  {state.error && (
                    <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
                      {state.error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    {!state.needsJurisdiction && (
                      <button
                        type="submit"
                        name="isOfAge"
                        value="no"
                        formNoValidate
                        className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-2 text-[var(--scale-sm)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface)]"
                      >
                        I'm under 21
                      </button>
                    )}
                    <button
                      type="submit"
                      name="isOfAge"
                      value="yes"
                      disabled={pending}
                      className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-2 text-[var(--scale-sm)] font-medium text-[var(--color-surface)] transition-colors hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
                    >
                      {pending ? "Checking…" : state.needsJurisdiction ? "Continue" : "I'm 21 or older"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
