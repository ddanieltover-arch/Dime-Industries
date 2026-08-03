// components/auth/signup-form.tsx
"use client";

import { useActionState, useCallback } from "react";
import Link from "next/link";
import { signUpWithEmail, type AuthActionState } from "@/app/(auth)/actions";
import { GaSuccessEffect } from "@/components/analytics/ga-success-effect";
import { trackSignUp } from "@/lib/analytics/track";

const initial: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, initial);
  const onSignUp = useCallback(() => trackSignUp("email"), []);

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-[var(--container-pad-x)] py-16">
      <div>
        <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
          Account
        </p>
        <h1 className="section-title mt-2">Create account</h1>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Password must be at least 10 characters with an uppercase letter and a number.
        </p>
      </div>

      {state.success ? (
        <>
          <GaSuccessEffect ready onSuccess={onSignUp} />
          <p role="status" className="text-[var(--scale-sm)] text-[var(--color-resin)]">
            Check your email to verify your account, then{" "}
            <Link href="/login" className="underline-offset-4 hover:underline">
              sign in
            </Link>
            .
          </p>
        </>
      ) : (
        <form action={formAction} className="space-y-4">
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Email
            <input type="email" name="email" required autoComplete="email" className="field-input mt-1.5" />
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
              className="field-input mt-1.5"
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
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>
      )}

      <p className="text-center text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
