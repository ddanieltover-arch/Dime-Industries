// components/home/newsletter-signup.tsx
"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterActionState } from "@/app/(marketing)/newsletter-actions";

const initialState: NewsletterActionState = {};

export function NewsletterSignup() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <section aria-labelledby="newsletter-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-ink)] p-8 text-[var(--color-bg)] sm:p-10">
        <h2 id="newsletter-heading" className="font-[var(--font-display)] text-[var(--scale-xl)]">
          New batches, first look
        </h2>
        <p className="mt-2 max-w-md text-[var(--scale-sm)] opacity-80">
          One email when a new drop lands. No spam, unsubscribe anytime.
        </p>

        {state.success ? (
          <p role="status" className="mt-6 text-[var(--scale-sm)] text-[var(--color-resin-strong)]">
            You're on the list — check your inbox to confirm.
          </p>
        ) : (
          <form action={formAction} className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              aria-invalid={Boolean(state.error)}
              aria-describedby={state.error ? "newsletter-error" : undefined}
              className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--scale-sm)] text-[var(--color-ink)]"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-6 py-2.5 text-[var(--scale-sm)] font-medium text-[var(--color-surface)] transition-colors hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
            >
              {pending ? "Signing up…" : "Sign up"}
            </button>
          </form>
        )}

        {state.error && (
          <p id="newsletter-error" role="alert" className="mt-2 text-[var(--scale-sm)] text-[var(--color-flag)]">
            {state.error}
          </p>
        )}
      </div>
    </section>
  );
}
