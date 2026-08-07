// app/403/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Access denied",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-[var(--font-display)] text-[var(--scale-3xl)] text-[var(--color-ink)]">
        Access denied
      </h1>
      <p className="mt-3 text-[var(--color-ink-soft)]">
        You don’t have permission to view this page.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-[var(--color-resin-strong)] underline-offset-4 hover:underline"
      >
        Back home
      </Link>
    </div>
  );
}
