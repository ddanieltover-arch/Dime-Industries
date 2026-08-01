// app/rewards/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRewardsAppUrl } from "@/lib/integrations/rewards/client";
import { POINTS_PER_DOLLAR, REDEEM_POINTS_PER_DOLLAR } from "@/lib/loyalty/constants";

export const metadata: Metadata = {
  title: "Rewards",
  description:
    "Join DIME Rewards — validate products, earn points, unlock Silver / Gold / Rose Gold tiers, and redeem toward discounts and early access.",
  alternates: { canonical: "/rewards" },
};

const HOW = [
  {
    title: "Validate your products",
    body: "Scratch and register package codes to confirm authenticity, activate warranty, and earn points.",
    href: "/validate",
    label: "Validate",
  },
  {
    title: "Level up with every scan",
    body: "Climb Silver, Gold, and Rose Gold tiers as you keep validating and shopping.",
    href: "#tiers",
    label: "See tiers",
  },
  {
    title: "Complete campaigns",
    body: "Bonus point campaigns and milestones stack on top of everyday earns.",
    href: "/app",
    label: "DIME App",
  },
  {
    title: "Redeem on the DIME store",
    body: `${REDEEM_POINTS_PER_DOLLAR} points = $1 off online. Apply your balance at checkout or in the app.`,
    href: "/shop",
    label: "Shop now",
  },
] as const;

const TIERS = [
  {
    name: "Silver",
    detail: "1× points multiplier · 10% DIME merch discount · 50pt birthday bonus",
  },
  {
    name: "Gold",
    detail: "1.25× points · 15% merch discount · 100pt birthday bonus · early access to new drops",
  },
  {
    name: "Rose Gold",
    detail:
      "1.5× points · 20% merch discount · 150pt birthday bonus · early drops · invitations to special events",
  },
] as const;

const FAQ = [
  {
    q: "What is DIME Rewards?",
    a: "A points-based program that rewards customers with exclusive discounts, products, and experiences.",
  },
  {
    q: "How do I join?",
    a: "Create an account on this site or sign in to the DIME App when available — then validate products to start earning.",
  },
  {
    q: "How do I earn points?",
    a: `Earn by validating DIME products and shopping online (${POINTS_PER_DOLLAR} point per dollar on eligible orders). Bonus points come from campaigns and milestones.`,
  },
  {
    q: "Do my points expire?",
    a: "No — points do not expire.",
  },
  {
    q: "How do I redeem?",
    a: "Redeem on purchases in this storefront at checkout, or in the DIME App store when live.",
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
          <p className="section-eyebrow rewards-rise">Join DIME Rewards</p>
          <h1 className="rewards-rise mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-[0.06em] text-white [animation-delay:80ms]">
            Tap. Scan. Start earning.
          </h1>
          <p className="rewards-rise mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80 [animation-delay:140ms]">
            A points-based program with exclusive products and experiences — validate, level up, and redeem on the
            DIME store.
          </p>
          <div className="rewards-rise mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
            <Link href="/signup" className="btn-primary">
              Join rewards
            </Link>
            <Link href="/validate" className="btn-outline-light">
              Validate a product
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
            Validate. Level up. Redeem.
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            On-site loyalty is live now — shop and validate without leaving the storefront. Full campaigns and
            merch redemptions also run in the DIME App.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4" role="list">
            {HOW.map((way) => (
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
        id="tiers"
        aria-labelledby="tiers-heading"
        className="scroll-mt-24 border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Tiers
          </p>
          <h2 id="tiers-heading" className="section-title mt-2">
            Silver · Gold · Rose Gold
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Level up with every scan. Tier benefits match the DIME Rewards program on the brand app.
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
              Points system
            </p>
            <h2 id="rates-heading" className="section-title mt-2">
              Earn online, redeem online
            </h2>
            <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              Storefront earn and redeem rates are live today. App multipliers and merch discounts apply as you climb
              tiers in the DIME App.
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
        aria-labelledby="faq-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            DIME Rewards FAQ
          </p>
          <h2 id="faq-heading" className="section-title mt-2">
            Quick answers
          </h2>
          <ul className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]" role="list">
            {FAQ.map((item) => (
              <li key={item.q} className="py-6">
                <h3 className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {item.q}
                </h3>
                <p className="mt-2 max-w-3xl text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                  {item.a}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="access-heading"
        className="bg-[var(--color-surface)]"
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
              Create an account to track points online. Prefer mobile? The{" "}
              <Link href="/app" className="text-[var(--color-ink)] underline-offset-4 hover:underline">
                DIME App
              </Link>{" "}
              is where full Rewards campaigns and merch redemptions live.
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

          <aside className="border border-[var(--color-border)] bg-[var(--color-bg)] p-6 sm:p-8">
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

      <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
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
