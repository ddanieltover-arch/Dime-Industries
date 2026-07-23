// components/auth/login-form.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signInWithEmail,
  signInWithGoogle,
  signInDemo,
  type AuthActionState,
} from "@/app/(auth)/actions";

const initial: AuthActionState = {};

export function LoginForm({
  nextPath,
  supabaseConfigured,
  errorParam,
}: {
  nextPath: string;
  supabaseConfigured: boolean;
  errorParam?: string;
}) {
  const [state, formAction, pending] = useActionState(signInWithEmail, initial);
  const [demoState, demoAction, demoPending] = useActionState(signInDemo, initial);

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-16">
      <div>
        <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
          Sign in
        </h1>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Access orders, wishlist sync, and account preferences.
        </p>
      </div>

      {errorParam === "google_oauth_failed" ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          Google sign-in failed. Try email or try again later.
        </p>
      ) : null}

      {errorParam === "auth_misconfigured" ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          Authentication is not configured for this environment. Set Supabase keys or
          ALLOW_DEMO_AUTH=true for emergency demo access.
        </p>
      ) : null}

      {supabaseConfigured ? (
        <>
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
            </label>
            <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              Password
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
              />
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
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
            >
              Continue with Google
            </button>
          </form>

          <p className="text-center text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            No account?{" "}
            <Link href="/signup" className="text-[var(--color-resin-strong)] underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </>
      ) : (
        <form action={demoAction} className="space-y-4">
          <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Supabase is not configured in this environment. Use a demo customer session for local
            account pages.
          </p>
          <input type="hidden" name="next" value={nextPath} />
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Email
            <input
              type="email"
              name="email"
              required
              defaultValue="customer@example.com"
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
            />
          </label>
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Demo role
            <select
              name="role"
              defaultValue={nextPath.startsWith("/admin") ? "admin" : "customer"}
              className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-interactive)] bg-[var(--color-surface-raised)] px-3 py-2 text-[var(--scale-sm)] text-[var(--color-ink)]"
            >
              <option value="customer">Customer</option>
              <option value="wholesale">Wholesale</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {demoState.error ? (
            <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
              {demoState.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={demoPending}
            className="w-full rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-3 text-[var(--scale-sm)] text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
          >
            {demoPending ? "Starting…" : "Continue to account"}
          </button>
        </form>
      )}
    </div>
  );
}
