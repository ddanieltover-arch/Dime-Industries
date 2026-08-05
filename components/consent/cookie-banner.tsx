// components/consent/cookie-banner.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  acceptAllCookiesAction,
  rejectOptionalCookiesAction,
  type ConsentActionState,
} from "@/app/(consent)/actions";

const initial: ConsentActionState = {};

export function CookieBanner({ show }: { show: boolean }) {
  const [acceptState, acceptAction, acceptPending] = useActionState(acceptAllCookiesAction, initial);
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectOptionalCookiesAction,
    initial
  );

  if (!show) return null;

  const pending = acceptPending || rejectPending;
  const message = acceptState.message ?? rejectState.message;

  return (
    <div
      className="cookie-banner fixed inset-x-0 z-[55] border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-4 shadow-lg sm:px-6"
      role="dialog"
      aria-label="Cookie preferences"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
            Cookies
          </p>
          <p className="mt-2 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
            We use necessary cookies for the cart and age gate. Optional analytics and marketing
            cookies stay off until you choose. Manage anytime in{" "}
            <Link href="/cookies" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
              Cookie preferences
            </Link>
            .
          </p>
          {message ? (
            <p role="status" className="mt-2 text-[var(--scale-xs)] text-[var(--color-terp)]">
              {message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={rejectAction}>
            <button
              type="submit"
              disabled={pending}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] px-3 py-2 text-[var(--scale-xs)] text-[var(--color-ink)] disabled:opacity-60"
            >
              Necessary only
            </button>
          </form>
          <form action={acceptAction}>
            <button type="submit" disabled={pending} className="btn-primary px-3 py-2 text-[var(--scale-xs)]">
              Accept all
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
