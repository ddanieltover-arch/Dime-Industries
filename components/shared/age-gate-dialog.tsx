// components/shared/age-gate-dialog.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            headingRef.current?.focus();
          }}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          aria-describedby="age-gate-description"
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.needsJurisdiction ? "jurisdiction" : state.notAvailable ? "unavailable" : "age"}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg text-center"
            >
              <div className="relative mx-auto mb-8 h-12 w-40">
                <Image src="/brand/logo.png" alt="DIME" fill className="object-contain" sizes="160px" priority />
              </div>

              <Dialog.Title
                ref={headingRef}
                tabIndex={-1}
                className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-white outline-none sm:text-[var(--scale-3xl)]"
              >
                {state.notAvailable ? "Not yet available" : "Are you over 21?"}
              </Dialog.Title>

              <Dialog.Description
                id="age-gate-description"
                className="mx-auto mt-4 max-w-md text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]"
              >
                {state.notAvailable
                  ? "DIME currently serves California and Massachusetts only. We're not able to show pricing or products outside those states."
                  : "By clicking Yes and entering DIME Industries' site, I confirm I'm at least 21 or a qualified patient, and I agree to the Terms of Service and Privacy Policy."}
              </Dialog.Description>

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
            </motion.div>
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
