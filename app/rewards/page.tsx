// app/rewards/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRewardsAppUrl } from "@/lib/integrations/rewards/client";
import { POINTS_PER_DOLLAR, REDEEM_POINTS_PER_DOLLAR } from "@/lib/loyalty/constants";

export const metadata: Metadata = {
  title: "Rewards",
  description: "Earn points, unlock member discounts, and get early access to DIME drops.",
  alternates: { canonical: "/rewards" },
};

const TIERS = [
  {
    name: "Member",
    detail: "Earn points on purchases and product validation. Your starting tier for every account.",
  },
  {
    name: "Insider",
    detail: "Member discounts and early access to limited drops as you keep earning.",
  },
  {
    name: "Elite",
    detail: "Highest earn rate and priority support on warranty claims for top members.",
  },
] as const;

const WAYS = [
  {
    title: "Shop online",
    body: `Earn ${POINTS_PER_DOLLAR} point per dollar spent on eligible orders.`,
    href: "/shop",
    label: "Shop now",
  },
  {
    title: "Validate products",
    body: "Register package codes to confirm authenticity and unlock rewards credit.",
    href: "/validate",
    label: "Validate",
  },
  {
    title: "Redeem at checkout",
    body: `${REDEEM_POINTS_PER_DOLLAR} points = $1 off. Apply your balance when you pay.`,
    href: "/account/loyalty",
    label: "View my points",
  },
] as const;

export default function RewardsPage() {
  const rewardsApp = getRewardsAppUrl();

  return (
    <>
      <section className="relative isolate min-h-[min(72vh,640px)] overflow-hidden">
        <Image
          src="/brand/hero-poster.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_25%,rgba(201,177,56,0.18),transparent_50%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-14 pt-28 sm:pb-20 sm:pt-32">
          <p className="section-eyebrow rewards-rise">DIME</p>
          <h1 className="rewards-rise mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-[0.06em] text-white [animation-delay:80ms]">
            Rewards
          </h1>
          <p className="rewards-rise mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80 [animation-delay:140ms]">
            Earn points on every order, validate for credit, and redeem toward discounts and early access.
          </p>
          <div className="rewards-rise mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
            <Link href="/signup" className="btn-primary">
              Join rewards
            </Link>
            <Link href="/account/loyalty" className="btn-outline-light">
              View my points
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="earn-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            How it works
          </p>
          <h2 id="earn-heading" className="section-title mt-2">
            Earn on every order
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            On-site loyalty is live now — shop, validate, and redeem without leaving the storefront.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {WAYS.map((way) => (
              <li key={way.title} className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {way.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{way.body}</p>
                <Link
                  href={way.href}
                  className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
                >
                  {way.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="tiers-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Member tiers
          </p>
          <h2 id="tiers-heading" className="section-title mt-2">
            Grow with DIME
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Stay active to unlock better rates, early drops, and priority support.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {TIERS.map((tier) => (
              <li key={tier.name} className="bg-[var(--color-surface)] p-6 sm:p-8">
                <p className="font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.1em] text-[var(--color-resin)]">
                  {tier.name}
                </p>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{tier.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="rates-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              The math
            </p>
            <h2 id="rates-heading" className="section-title mt-2">
              Simple rates
            </h2>
            <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              Earn while you shop. Redeem when you&apos;re ready. No complicated multipliers on day one.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-[var(--color-border)]">
            <div className="bg-[var(--color-bg)] p-6 sm:p-8">
              <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                Earn
              </dt>
              <dd className="mt-3 font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.04em] text-[var(--color-resin)]">
                {POINTS_PER_DOLLAR}
                <span className="ml-2 text-[var(--scale-sm)] tracking-[0.1em] text-[var(--color-ink-soft)]">
                  pt / $1
                </span>
              </dd>
            </div>
            <div className="bg-[var(--color-bg)] p-6 sm:p-8">
              <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                Redeem
              </dt>
              <dd className="mt-3 font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.04em] text-[var(--color-resin)]">
                {REDEEM_POINTS_PER_DOLLAR}
                <span className="ml-2 text-[var(--scale-sm)] tracking-[0.1em] text-[var(--color-ink-soft)]">
                  pts = $1
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="access-heading"
        className="bg-[var(--color-bg)]"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Get started
            </p>
            <h2 id="access-heading" className="section-title mt-2">
              Join the program
            </h2>
            <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              Create an account to track points online. Existing members can still use the legacy Rewards app — and
              the{" "}
              <Link href="/app" className="text-[var(--color-ink)] underline-offset-4 hover:underline">
                DIME App
              </Link>{" "}
              when it&apos;s live.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Join rewards
              </Link>
              <Link href="/validate" className="btn-outline">
                Validate a product
              </Link>
            </div>
          </div>

          <aside className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Already a member?
            </p>
            <ul className="mt-5 space-y-4" role="list">
              <li>
                <Link
                  href="/account/loyalty"
                  className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
                >
                  View my points →
                </Link>
              </li>
              <li>
                <Link
                  href="/login?next=/account/loyalty"
                  className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
                >
                  Sign in →
                </Link>
              </li>
              <li>
                <a
                  href={rewardsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
                >
                  Legacy Rewards app →
                </a>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Current offers
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Stack rewards with checkout codes
            </p>
          </div>
          <Link href="/promotions" className="btn-primary shrink-0">
            View promotions
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes rewards-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rewards-rise {
          animation: rewards-rise 0.7s var(--ease-out) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .rewards-rise { animation: none !important; }
        }
      `}</style>
    </>
  );
}
