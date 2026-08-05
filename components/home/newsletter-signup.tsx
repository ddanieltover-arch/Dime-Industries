// components/home/newsletter-signup.tsx
"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterActionState } from "@/app/(marketing)/newsletter-actions";
import { Reveal } from "@/components/motion";

const initialState: NewsletterActionState = {};

type Props = {
  headline?: string;
  body?: string;
};

export function NewsletterSignup({
  headline = "Members newsletter",
  body = "Drops, promotions, and early access — straight to your inbox.",
}: Props = {}) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <Reveal className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)] text-center">
        <h2 id="newsletter-heading" className="section-title">
          {headline}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          {body}
        </p>

        {state.success ? (
          <p role="status" className="status-pulse mt-8 text-[var(--scale-sm)] text-[var(--color-resin)]">
            You&apos;re on the list — check your inbox for a welcome email.
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
              autoComplete="email"
              inputMode="email"
              enterKeyHint="send"
              aria-invalid={Boolean(state.error)}
              aria-describedby={state.error ? "newsletter-error" : undefined}
              className="field-input field-control min-h-12 flex-1"
            />
            <button
              type="submit"
              disabled={pending}
              className="btn-primary min-h-12 w-full shrink-0 touch-manipulation sm:w-auto"
            >
              {pending ? "Signing up…" : "Sign up"}
            </button>
          </form>
        )}

        {state.error && (
          <p id="newsletter-error" role="alert" className="mt-3 text-[var(--scale-sm)] text-[var(--color-flag)]">
            {state.error}
          </p>
        )}
      </Reveal>
    </section>
  );
}
