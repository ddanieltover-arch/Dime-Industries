// components/shared/age-gate-dialog.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { confirmAgeGate, type AgeGateActionState } from "@/app/(compliance)/actions";
import { FadeInItem, FadeInStagger } from "@/components/motion";

const initialState: AgeGateActionState = {};

/**
 * Full-viewport age gate — fixed overlay so chrome/bottom nav cannot cover CTAs.
 * Success does a hard navigation so cookies + RSC stay in sync.
 */
export function AgeGateDialog({ initiallyOpen }: { initiallyOpen: boolean }) {
  const [state, formAction, pending] = useActionState(confirmAgeGate, initialState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const gateSucceeded = Boolean(state.success);

  useEffect(() => {
    if (!gateSucceeded) return;
    // Preserve query + hash so deep links / UTMs survive age verification.
    window.location.replace(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
  }, [gateSucceeded]);

  useEffect(() => {
    if (initiallyOpen && !gateSucceeded) headingRef.current?.focus();
  }, [initiallyOpen, gateSucceeded]);

  useEffect(() => {
    if (!initiallyOpen || gateSucceeded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [initiallyOpen, gateSucceeded]);

  useEffect(() => {
    if (!initiallyOpen || gateSucceeded) return;
    const root = dialogRef.current;
    if (!root) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0,
      );
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!root.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [initiallyOpen, gateSucceeded]);

  if (!initiallyOpen) return null;

  if (gateSucceeded) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black px-6 text-center">
        <p className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.14em] text-[var(--color-resin)]">
          Entering DIME…
        </p>
      </div>
    );
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-description"
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-black"
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

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-[max(3rem,env(safe-area-inset-top))] sm:px-8 sm:pt-16">
          <FadeInStagger className="mx-auto w-full max-w-lg text-center">
            <FadeInItem>
              <div className="relative mx-auto mb-8 h-12 w-40 sm:mb-10 sm:h-14 sm:w-44">
                <Image
                  src="/brand/logo.png"
                  alt="DIME"
                  fill
                  className="object-contain"
                  sizes="176px"
                  priority
                />
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
                className="mt-3 font-[var(--font-display)] text-[clamp(1.75rem,7vw,3rem)] uppercase tracking-[0.08em] text-white outline-none"
              >
                Are you over 21?
              </h2>
            </FadeInItem>

            <FadeInItem>
              <p
                id="age-gate-description"
                className="mx-auto mt-5 max-w-md text-[var(--scale-sm)] leading-relaxed text-white/70"
              >
                By tapping Yes, I confirm I&apos;m at least 21 or a qualified patient, and I agree to the{" "}
                <Link
                  href="/legal/terms"
                  className="text-white underline underline-offset-4 hover:text-[var(--color-resin)]"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/privacy"
                  className="text-white underline underline-offset-4 hover:text-[var(--color-resin)]"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </FadeInItem>

            {state.error ? (
              <FadeInItem>
                <p role="alert" className="mt-6 text-[var(--scale-sm)] text-[var(--color-flag)]">
                  {state.error}
                </p>
              </FadeInItem>
            ) : null}
          </FadeInStagger>
        </div>

        <form
          action={formAction}
          className="relative border-t border-white/10 bg-black/90 px-5 pt-4 backdrop-blur-md sm:px-8"
          style={{
            paddingBottom: "max(1.25rem, calc(0.75rem + env(safe-area-inset-bottom)))",
          }}
        >
          <div className="mx-auto flex w-full max-w-lg flex-col gap-3 sm:flex-row-reverse sm:justify-center">
            <button
              type="submit"
              name="isOfAge"
              value="yes"
              disabled={pending}
              className="btn-primary min-h-12 w-full touch-manipulation sm:min-w-[10rem] sm:flex-1"
            >
              {pending ? "Checking…" : "Yes — enter"}
            </button>
            <button
              type="submit"
              name="isOfAge"
              value="no"
              formNoValidate
              className="btn-outline-light min-h-12 w-full touch-manipulation sm:min-w-[10rem] sm:flex-1"
            >
              No
            </button>
          </div>
          <p className="mx-auto mt-3 max-w-lg text-center text-[var(--scale-xs)] text-white/45">
            You must be 21+ to shop DIME products.
          </p>
        </form>
      </div>
    </div>
  );
}
