// app/signup/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { isSupabaseConfigured } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] text-[var(--color-ink)]">
          Signup unavailable
        </h1>
        <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          Supabase Auth is not configured. Use the demo session on the sign-in page.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return <SignupForm />;
}
