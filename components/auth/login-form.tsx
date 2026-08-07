// components/auth/login-form.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithEmail, signInDemo, type AuthActionState } from "@/app/(auth)/actions";

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
    <div className="mx-auto w-full max-w-md space-y-8 px-[var(--container-pad-x)] py-16">
      <div>
        <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
          Account
        </p>
        <h1 className="section-title mt-2">Sign in</h1>
        <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Access orders, wishlist sync, and account preferences.
        </p>
      </div>

      {errorParam === "auth_misconfigured" ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          Authentication is not configured for this environment. Set Supabase keys or ALLOW_DEMO_AUTH=true for
          emergency demo access.
        </p>
      ) : null}

      {supabaseConfigured ? (
        <>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              Email
              <input type="email" name="email" required autoComplete="email" className="field-input mt-1.5" />
            </label>
            <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
              Password
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="field-input mt-1.5"
              />
            </label>
            {state.error ? (
              <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
                {state.error}
              </p>
            ) : null}
            <button type="submit" disabled={pending} className="btn-primary w-full">
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            No account?{" "}
            <Link
              href={nextPath && nextPath !== "/account" ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup"}
              className="text-[var(--color-resin)] underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </>
      ) : (
        <form action={demoAction} className="space-y-4">
          <p className="text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Supabase is not configured in this environment. Use a demo customer session for local account pages.
          </p>
          <input type="hidden" name="next" value={nextPath} />
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Email
            <input
              type="email"
              name="email"
              required
              defaultValue="customer@example.com"
              className="field-input mt-1.5"
            />
          </label>
          <label className="block text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
            Demo role
            <select
              name="role"
              defaultValue={nextPath.startsWith("/admin") ? "admin" : "customer"}
              className="field-input mt-1.5"
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
          <button type="submit" disabled={demoPending} className="btn-primary w-full">
            {demoPending ? "Starting…" : "Continue to account"}
          </button>
        </form>
      )}
    </div>
  );
}
