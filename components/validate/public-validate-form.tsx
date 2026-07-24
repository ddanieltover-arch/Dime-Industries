// components/validate/public-validate-form.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  submitPublicValidation,
  type PublicValidateState,
} from "@/app/(marketing)/validate-actions";

const initial: PublicValidateState = {};

export function PublicValidateForm() {
  const [state, formAction, pending] = useActionState(submitPublicValidation, initial);

  return (
    <form action={formAction} className="mx-auto max-w-md space-y-4">
      <label className="block font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-resin)]">
        Validation code
        <input
          name="code"
          required
          placeholder="Scratch code or product SKU"
          className="mt-2 w-full rounded-full border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-5 py-3 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
      </label>
      <p className="text-[var(--scale-xs)] text-[var(--color-ink-soft)]">
        Scratch the code on your package fully so you can read it correctly. SKU codes from the catalog also work for
        demo verification.
      </p>
      {state.error ? (
        <p role="alert" className="text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <div role="status" className="space-y-2 text-[var(--scale-sm)] text-[var(--color-resin)]">
          <p>{state.message}</p>
          <p className="text-[var(--color-ink-soft)]">
            <Link href="/account/validate" className="underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to sync warranty and rewards, or{" "}
            <Link href="/rewards" className="underline-offset-4 hover:underline">
              learn about Rewards
            </Link>
            .
            {state.productSlug ? (
              <>
                {" "}
                <Link href={`/product/${state.productSlug}`} className="underline-offset-4 hover:underline">
                  View product
                </Link>
              </>
            ) : null}
          </p>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
      >
        {pending ? "Checking…" : "Validate"}
      </button>
    </form>
  );
}
