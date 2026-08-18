// components/shared/route-error-fallback.tsx
"use client";

import { useEffect } from "react";

export function RouteErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry is the real destination (instrumentation.onRequestError).
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-2xl px-[var(--container-pad-x)] py-24 text-center">
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
        Error
      </p>
      <h1 className="section-title mt-3">Something went wrong</h1>
      <p className="mt-4 text-[var(--scale-base)] text-[var(--color-ink-soft)]">
        This wasn&apos;t your mistake — try again, or head back to the homepage.
      </p>
      {process.env.NODE_ENV !== "production" || error.digest ? (
        <p className="mt-4 break-all font-[var(--font-mono)] text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
          {error.message}
          {error.digest ? ` · ${error.digest}` : ""}
        </p>
      ) : null}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <a href="/" className="btn-outline">
          Go home
        </a>
      </div>
    </div>
  );
}
