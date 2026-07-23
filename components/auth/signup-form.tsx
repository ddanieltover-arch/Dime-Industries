// components/auth/signup-form.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail, type AuthActionState } from "@/app/(auth)/actions";

const initial: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, initial);

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-16">
      <div>
        <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
          Create account
        </h1>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Password must be at least 10 characters with an uppercase letter and a number.
        </p>
      </div>

      {state.success ? (
        <p role="status" className="text-[var(--scale-sm)] text-[var(--color-terp)]">
          Check your email to verify your account, then{" "}
          <Link href="/login" className="underline-offset-4 hover:underline">
            sign in
          </Link>
          .
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
            />
            {state.fieldErrors?.email ? (
              <span className="mt-1 block text-[var(--color-flag)]">{state.fieldErrors.email[0]}</span>
            ) : null}
          </label>
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
            />
            {state.fieldErrors?.password ? (
              <span className="mt-1 block text-[var(--color-flag)]">{state.fieldErrors.password[0]}</span>
            ) : null}
          </label>
          {state.error ? (
            <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>
      )}

      <p className="text-center text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-resin-strong)] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
