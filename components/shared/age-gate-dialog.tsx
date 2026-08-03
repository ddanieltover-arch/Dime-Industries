// components/shared/age-gate-dialog.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { confirmAgeGate, type AgeGateActionState } from "@/app/(compliance)/actions";
import { FadeInItem, FadeInStagger } from "@/components/motion";

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
    window.location.replace(window.location.pathname);
  }, [gateSucceeded]);

  useEffect(() => {
    if (initiallyOpen && !gateSucceeded) headingRef.current?.focus();
  }, [initiallyOpen, gateSucceeded]);

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
      className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-black px-6 py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(/brand/concrete.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" aria-hidden="true" />

      <FadeInStagger className="relative w-full max-w-lg text-center">
        <FadeInItem>
          <div className="relative mx-auto mb-10 h-14 w-44">
            <Image src="/brand/logo.png" alt="DIME" fill className="object-contain" sizes="176px" priority />
          </div>
        </FadeInItem>

        <FadeInItem>
          <p className="section-eyebrow text-[var(--scale-xl)] sm:text-[var(--scale-2xl)]">
            Elevate your experience
          </p>
        </FadeInItem>

        <FadeInItem>
          <h2
            id="age-gate-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-white outline-none sm:text-[var(--scale-3xl)]"
          >
            Are you over 21?
          </h2>
        </FadeInItem>

        <FadeInItem>
          <p
            id="age-gate-description"
            className="mx-auto mt-5 max-w-md text-[var(--scale-sm)] leading-relaxed text-white/70"
          >
            By clicking Yes and entering DIME Industries&apos; site, I confirm I&apos;m at least 21 or a
            qualified patient, and I agree to the Terms of Service and Privacy Policy.
          </p>
        </FadeInItem>

        <FadeInItem>
          <form action={formAction} className="mt-12 space-y-4">
            {state.error && (
              <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
                {state.error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button type="submit" name="isOfAge" value="no" formNoValidate className="btn-outline-light min-w-[8rem]">
                No
              </button>
              <button type="submit" name="isOfAge" value="yes" disabled={pending} className="btn-primary min-w-[8rem]">
                {pending ? "Checking…" : "Yes"}
              </button>
            </div>
          </form>
        </FadeInItem>
      </FadeInStagger>
    </div>
  );
}
