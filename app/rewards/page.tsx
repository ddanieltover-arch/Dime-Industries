// app/rewards/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rewards",
  description: "Earn points, unlock member discounts, and get early access to DIME drops.",
  alternates: { canonical: "/rewards" },
};

const TIERS = [
  { name: "Member", detail: "Earn points on purchases and product validation." },
  { name: "Insider", detail: "Member discounts and early access to limited drops." },
  { name: "Elite", detail: "Highest earn rate and priority support on warranty claims." },
];

export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-[var(--color-ink)] sm:text-[var(--scale-3xl)]">
          DIME Rewards
        </h1>
        <p className="mt-4 text-[var(--scale-base)] text-[var(--color-ink-soft)]">
          Validate your products, shop online, and earn points toward discounts and early access. Syncs with the live
          rewards host when configured.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black hover:bg-[var(--color-resin-hover)]"
          >
            Join rewards
          </Link>
          <Link
            href="/account/loyalty"
            className="rounded-full border border-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-[var(--color-resin)] hover:bg-[var(--color-resin)] hover:text-black"
          >
            View my points
          </Link>
          <Link
            href="/validate"
            className="rounded-full border border-white/40 px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-white hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
          >
            Validate a product
          </Link>
        </div>
      </div>

      <ul className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3" role="list">
        {TIERS.map((t) => (
          <li key={t.name} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
            <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.1em] text-[var(--color-resin)]">
              {t.name}
            </p>
            <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{t.detail}</p>
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-12 max-w-2xl text-center text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Prefer the mobile experience? See the{" "}
        <Link href="/app" className="text-[var(--color-resin)] hover:underline">
          DIME App
        </Link>
        .
      </p>
    </div>
  );
}
