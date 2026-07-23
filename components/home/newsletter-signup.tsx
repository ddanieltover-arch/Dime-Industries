// components/home/newsletter-signup.tsx
"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterActionState } from "@/app/(marketing)/newsletter-actions";

const initialState: NewsletterActionState = {};

export function NewsletterSignup() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2
          id="newsletter-heading"
          className="font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.1em] text-white sm:text-[var(--scale-2xl)]"
        >
          Access our members only newsletter
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Sign up now for drops, promotions, and early access.
        </p>

        {state.success ? (
          <p role="status" className="mt-8 text-[var(--scale-sm)] text-[var(--color-resin)]">
            You&apos;re on the list — check your inbox to confirm.
          </p>
        ) : (
          <form action={formAction} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              placeholder="Email address"
              aria-invalid={Boolean(state.error)}
              aria-describedby={state.error ? "newsletter-error" : undefined}
              className="flex-1 rounded-full border border-[var(--color-border-interactive)] bg-[var(--color-bg)] px-5 py-3 text-[var(--scale-sm)] text-[var(--color-ink)]"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black transition-colors hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
            >
              {pending ? "Signing up…" : "Sign up now"}
            </button>
          </form>
        )}

        {state.error && (
          <p id="newsletter-error" role="alert" className="mt-3 text-[var(--scale-sm)] text-[var(--color-flag)]">
            {state.error}
          </p>
        )}
      </div>
    </section>
  );
}
