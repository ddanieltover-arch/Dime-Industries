// components/home/rewards-teaser.tsx
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { POINTS_PER_DOLLAR, REDEEM_POINTS_PER_DOLLAR } from "@/lib/loyalty/constants";

export function RewardsTeaser({
  pointsBalance,
  signedIn,
  headline = "Tap. Scan. Start earning.",
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
  const defaultBody =
    body ??
    `Join DIME Rewards — validate products, activate warranty, and earn ${POINTS_PER_DOLLAR} point per dollar (${REDEEM_POINTS_PER_DOLLAR} pts = $1 off at checkout).`;
  // Signed-in users always get account loyalty — CMS guest CTAs must not override.
  const primaryHref = signedIn ? "/account/loyalty" : (ctaHref ?? "/rewards");
  const primaryLabel = signedIn ? "View my points" : (ctaLabel ?? "Join rewards");

  return (
    <section
      aria-labelledby="rewards-teaser-heading"
      className="border-y border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <Reveal className="mx-auto grid max-w-7xl items-center gap-8 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            DIME Rewards
          </p>
          <h2 id="rewards-teaser-heading" className="section-title mt-2">
            {headline}
          </h2>
          <p className="mt-4 max-w-xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            {defaultBody}
          </p>
          {signedIn && typeof pointsBalance === "number" ? (
            <p className="mt-4 font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.1em] text-[var(--color-resin)]">
              Your balance · {pointsBalance} pts
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
          <Link href={primaryHref} className="btn-primary min-h-12 w-full touch-manipulation sm:w-auto">
            {primaryLabel}
          </Link>
          <Link href="/rewards" className="btn-outline min-h-12 w-full touch-manipulation sm:w-auto">
            How it works
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
