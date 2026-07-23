// app/error.tsx
"use client";

import { useEffect } from "react";

export default function HomeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Sentry is the real destination for this (Infrastructure §4 / DevOps
    // Architecture §10) — console.error here as the local-dev fallback so
    // this isn't silently swallowed before that wiring exists.
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
        Something went wrong loading this page
      </h1>
      <p className="mt-3 text-[var(--scale-base)] text-[var(--color-ink-soft)]">
        This wasn't your mistake — try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-6 py-3 text-[var(--scale-sm)] font-medium text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)]"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-6 py-3 text-[var(--scale-sm)] text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
