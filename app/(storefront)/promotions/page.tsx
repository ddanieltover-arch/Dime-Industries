// app/promotions/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BundlesRail } from "@/components/home/bundles-rail";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { isCouponCurrentlyValid } from "@/lib/coupons/logic";
import { listCoupons } from "@/lib/coupons/store";
import type { Coupon } from "@/lib/coupons/types";
import { getFeaturedBundles } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Promotions",
  description:
    "Current DIME offers — coupon codes, bundle deals, and member rewards. Shop lab-tested vapes, edibles, and prerolls.",
  alternates: { canonical: "/promotions" },
};

function couponHeadline(coupon: Coupon): string {
  if (coupon.type === "percentage") return `${coupon.value}% off`;
  return `${formatPrice(coupon.value)} off`;
}

function couponDetail(coupon: Coupon): string {
  const parts: string[] = [];
  if (coupon.minSubtotalCents > 0) {
    parts.push(`Min. order ${formatPrice(coupon.minSubtotalCents)}`);
  } else {
    parts.push("No minimum");
  }
  if (coupon.endsAt) {
    parts.push(`Ends ${new Date(coupon.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
  }
  return parts.join(" · ");
}

const PATHS = [
  {
    title: "Shop the catalog",
    body: "Browse award-winning vapes, edibles, and prerolls — then apply a code at checkout.",
    href: "/shop",
    label: "Shop now",
  },
  {
    title: "Rewards members",
    body: "Earn points on every order and redeem toward discounts and early access.",
    href: "/rewards",
    label: "Join rewards",
  },
  {
    title: "Validate & earn",
    body: "Register your package code to confirm authenticity and unlock loyalty credit.",
    href: "/validate",
    label: "Validate",
  },
] as const;

export default async function PromotionsPage() {
  const [coupons, bundles] = await Promise.all([listCoupons(), getFeaturedBundles()]);
  const activeOffers = coupons.filter((c) => isCouponCurrentlyValid(c));

  return (
    <>
      {/* Hero — one composition: brand, headline, support, CTAs, full-bleed visual */}
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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,177,56,0.14),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-14 pt-28 sm:pb-20 sm:pt-32">
          <p className="section-eyebrow rise">DIME</p>
          <h1 className="rise rise-delay-1 mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
            Promotions
          </h1>
          <p className="rise rise-delay-2 mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">
            Bundle deals, checkout codes, and member perks — lab-tested products ready to shop.
          </p>
          <div className="rise rise-delay-3 mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop now
            </Link>
            <Link href="/shop/bundles" className="btn-outline-light">
              Shop bundles
            </Link>
          </div>
        </div>
      </section>

      {/* Current codes */}
      <section
        aria-labelledby="offers-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <Reveal>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Current offers
            </p>
            <h2 id="offers-heading" className="section-title mt-2">
              Checkout codes
            </h2>
            <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Apply these codes in your cart before checkout. Offers update as new drops land.
            </p>
          </Reveal>

          {activeOffers.length > 0 ? (
            <Stagger as="ul" className="mt-10 divide-y divide-[var(--color-border)] border border-[var(--color-border)]" role="list">
              {activeOffers.map((coupon) => (
                <StaggerItem
                  key={coupon.id}
                  as="li"
                  className="group flex flex-col gap-4 bg-[var(--color-surface)] px-5 py-5 transition-[background-color,box-shadow] duration-[var(--motion-base)] ease-[var(--ease-out)] hover:bg-[var(--color-surface-raised)] hover:shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:px-8"
                >
                  <div className="min-w-0">
                    <p className="font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.12em] text-[var(--color-resin)]">
                      {coupon.code}
                    </p>
                    <p className="mt-1 font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                      {couponHeadline(coupon)}
                    </p>
                    <p className="mt-1 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">{couponDetail(coupon)}</p>
                  </div>
                  <Link
                    href="/cart"
                    className="btn-outline shrink-0 self-start sm:self-auto"
                  >
                    Apply in cart
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Reveal className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center">
              <p className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                New drops soon
              </p>
              <p className="mx-auto mt-3 max-w-md text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                No active checkout codes right now. Browse bundles below, or join the list for drop alerts.
              </p>
              <Link href="/shop" className="btn-primary mt-6 inline-flex">
                Browse shop
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* Bundles */}
      {bundles ? <BundlesRail section={bundles} /> : null}

      {/* Ways to save */}
      <section
        aria-labelledby="paths-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <Reveal>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              More ways to save
            </p>
            <h2 id="paths-heading" className="section-title mt-2">
              Member perks
            </h2>
            <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Codes are only one path — rewards and validation unlock ongoing value.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {PATHS.map((path) => (
              <StaggerItem key={path.href} as="li" className="bg-[var(--color-surface)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {path.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{path.body}</p>
                <Link
                  href={path.href}
                  className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
                >
                  {path.label} →
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <NewsletterSignup
        headline="Never miss a drop"
        body="Promotions, limited drops, and early access — straight to your inbox."
      />
    </>
  );
}
