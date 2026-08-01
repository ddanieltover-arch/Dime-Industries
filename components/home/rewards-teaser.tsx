// components/home/rewards-teaser.tsx
import Link from "next/link";
import { POINTS_PER_DOLLAR, REDEEM_POINTS_PER_DOLLAR } from "@/lib/loyalty/constants";

export function RewardsTeaser({
  pointsBalance,
  signedIn,
  headline = "Earn on every order",
  body,
  ctaLabel,
  ctaHref,
}: {
  pointsBalance?: number;
  signedIn?: boolean;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const defaultBody = `Get ${POINTS_PER_DOLLAR} point per dollar spent. Redeem ${REDEEM_POINTS_PER_DOLLAR} points for $1 off at checkout — and validate products for warranty + rewards credit.`;
  const primaryHref = ctaHref ?? (signedIn ? "/account/loyalty" : "/signup");
  const primaryLabel = ctaLabel ?? (signedIn ? "View my points" : "Join rewards");

  return (
    <section
      aria-labelledby="rewards-teaser-heading"
      className="border-y border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            DIME Rewards
          </p>
          <h2 id="rewards-teaser-heading" className="section-title mt-2">
            {headline}
          </h2>
          <p className="mt-4 max-w-xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            {body ?? defaultBody}
          </p>
          {signedIn && typeof pointsBalance === "number" ? (
            <p className="mt-4 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.1em] text-[var(--color-resin)]">
              Your balance · {pointsBalance} pts
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href={primaryHref} className="btn-primary">
            {primaryLabel}
          </Link>
          <Link href="/rewards" className="btn-outline">
            How it works
          </Link>
        </div>
      </div>
    </section>
  );
}
