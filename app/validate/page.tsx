// app/validate/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { AnswerCapsule } from "@/components/seo/answer-capsule";
import { PublicValidateForm } from "@/components/validate/public-validate-form";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  buildBreadcrumbJsonLd,
  buildHowToJsonLd,
  VALIDATE_HOWTO_STEPS,
} from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Validate Your Products",
  description:
    "Confirm your DIME product is genuine. Scratch the code, verify authenticity, activate limited warranty, and claim rewards.",
  alternates: { canonical: "/validate" },
};

const STEPS = [
  {
    title: "Scratch the code",
    body: "Find the validation panel on your package and scratch it fully so every character (or QR) is readable.",
  },
  {
    title: "Enter & verify",
    body: "Type the code below — or scan with your phone when using the DIME App. Catalog SKUs also work for demo verification until the live host is connected.",
  },
  {
    title: "Claim points & warranty",
    body: "Confirm authenticity, activate limited no-hassle warranty coverage, and earn Rewards credit when you sign in.",
  },
  {
    title: "Redeem rewards",
    body: "Use points toward discounts on this storefront and exclusive perks in the DIME App when available.",
  },
] as const;

const PERKS = [
  {
    title: "Authenticity",
    body: "Confirm your product is real DIME — not a counterfeit lookalike. Buy only from licensed retailers.",
    href: "/lab-results",
    label: "Lab results",
  },
  {
    title: "Limited warranty",
    body: "Activate the no-hassle warranty path for eligible hardware issues once your product is registered.",
    href: "/legal/returns",
    label: "Returns policy",
  },
  {
    title: "Rewards credit",
    body: "Sign in after validating to sync loyalty points, campaigns, and member perks.",
    href: "/rewards",
    label: "Join rewards",
  },
] as const;

export default function ValidatePage() {
  const howTo = buildHowToJsonLd({
    name: "How to validate a DIME product",
    description:
      "Scratch the package code, verify authenticity on Validate, activate limited warranty, and earn Rewards.",
    url: "/validate",
    steps: VALIDATE_HOWTO_STEPS,
  });
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Validate", path: "/validate" },
  ]);

  return (
    <>
      <JsonLdScript data={howTo} />
      <JsonLdScript data={breadcrumbs} />

      <section className="relative isolate min-h-[min(72vh,640px)] overflow-hidden">
        <Image
          src="/brand/validate.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgba(201,177,56,0.16),transparent_50%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-14 pt-28 sm:pb-20 sm:pt-32">
          <p className="section-eyebrow rise">DIME</p>
          <h1 className="rise rise-delay-1 mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
            Validate your product
          </h1>
          <div className="rise rise-delay-2 mt-4 max-w-xl">
            <AnswerCapsule className="bg-black/35 [&_p]:text-[var(--color-resin)] [&_div]:font-normal [&_div]:text-white/90">
              Scratch the code on your DIME package, enter it on Validate (or scan in the DIME App),
              confirm authenticity, then unlock limited warranty and Rewards when eligible. Buy only
              from licensed retailers.
            </AnswerCapsule>
          </div>
          <p className="rise rise-delay-2 mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">
            Confirm your DIME product is genuine and safe to use — then unlock limited warranty and Rewards.
          </p>
          <div className="rise rise-delay-3 mt-8 flex flex-wrap gap-3">
            <a href="#validate-form" className="btn-primary">
              Enter code
            </a>
            <Link href="/rewards" className="btn-outline-light">
              Learn about Rewards
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="steps-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <Reveal>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              How it works
            </p>
            <h2 id="steps-heading" className="section-title mt-2">
              Scratch. Verify. Earn.
            </h2>
            <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Eligible validations unlock Rewards. Every registered DIME product is backed by a limited
              &ldquo;no hassle&rdquo; warranty.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4" role="list">
            {STEPS.map((step, index) => (
              <StaggerItem key={step.title} as="li" className="bg-[var(--color-bg)] p-6 sm:p-8">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                  Step 0{index + 1}
                </p>
                <h3 className="mt-3 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{step.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section
        id="validate-form"
        aria-labelledby="form-heading"
        className="scroll-mt-24 bg-[var(--color-bg)]"
      >
        <Reveal className="mx-auto grid max-w-7xl items-start gap-12 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Authenticity
            </p>
            <h2 id="form-heading" className="section-title mt-2">
              Verify your products
            </h2>
            <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              Enter the scratch code from your package. Prefer to sync warranty and points to your account?{" "}
              <Link href="/account/validate" className="text-[var(--color-ink)] underline-offset-4 hover:underline">
                Validate while signed in
              </Link>
              .
            </p>
          </div>

          <div className="glass-panel border border-[var(--color-border)] p-6 sm:p-8">
            <PublicValidateForm />
          </div>
        </Reveal>
      </section>

      <section
        aria-labelledby="perks-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Why validate
          </p>
          <h2 id="perks-heading" className="section-title mt-2">
            What you unlock
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            One code protects the product and opens the member path.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {PERKS.map((perk) => (
              <li key={perk.title} className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {perk.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{perk.body}</p>
                <Link
                  href={perk.href}
                  className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
                >
                  {perk.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Need help?
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Code won&apos;t scratch or won&apos;t verify
            </p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Contact support
          </Link>
        </div>
      </section>
    </>
  );
}
