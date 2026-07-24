// app/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DIME App",
  description: "Validate products, earn rewards, and get early access to drops in the DIME app.",
  alternates: { canonical: "/app" },
};

export default function AppMarketingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
      <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-[var(--color-ink)] sm:text-[var(--scale-3xl)]">
        The DIME App
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[var(--scale-base)] text-[var(--color-ink-soft)]">
        Validate products on the go, track loyalty points, and get early access to limited drops. App Store and Google
        Play links will appear here when published — until then, use Rewards and Validate on the web.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/rewards"
          className="rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black hover:bg-[var(--color-resin-hover)]"
        >
          Open Rewards
        </Link>
        <Link
          href="/validate"
          className="rounded-full border border-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-[var(--color-resin)]"
        >
          Validate
        </Link>
        <a
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/40 px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-white hover:border-[var(--color-resin)]"
        >
          App Store
        </a>
        <a
          href="https://play.google.com/store"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/40 px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-white hover:border-[var(--color-resin)]"
        >
          Google Play
        </a>
      </div>
    </div>
  );
}
