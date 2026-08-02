// app/about/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "DIME Industries is a licensed cannabis brand founded in 2016. Award-winning vapes, edibles, and prerolls — engineered hardware, lab-tested quality.",
  alternates: { canonical: "/about" },
};

const PILLARS = [
  {
    title: "Engineered hardware",
    body: "We design our own tanks and devices instead of buying generic parts — so draw quality and leak resistance stay consistent.",
  },
  {
    title: "Lab-tested standards",
    body: "Every batch is third-party tested. Potency and purity aren’t marketing claims — they’re published records you can look up.",
  },
  {
    title: "Award-winning craft",
    body: "Innovation takes center stage. Recognition across leading industry publications follows the same bar we set for every SKU.",
  },
] as const;

const GALLERY = [
  {
    src: "/brand/awards-hardware.webp",
    alt: "Industry award trophies on dark concrete",
    className: "col-span-2 aspect-[16/10] sm:col-span-2",
  },
  {
    src: "/brand/awards-medals.webp",
    alt: "Gold award medals and engraved plaque",
    className: "aspect-[4/5]",
  },
  {
    src: "/brand/awards.webp",
    alt: "DIME award-winning product lineup",
    className: "aspect-[4/5]",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate min-h-[min(72vh,640px)] overflow-hidden">
        <Image
          src="/brand/awards-hardware.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(201,177,56,0.16),transparent_50%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-14 pt-28 sm:pb-20 sm:pt-32">
          <p className="section-eyebrow rise">DIME</p>
          <h1 className="rise rise-delay-1 mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
            About Us
          </h1>
          <p className="rise rise-delay-2 mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">
            A licensed cannabis brand founded in 2016 — building award-winning products from the hardware up.
          </p>
          <div className="rise rise-delay-3 mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop now
            </Link>
            <Link href="/locations" className="btn-outline-light">
              Find DIME
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="story-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <Reveal className="mx-auto grid max-w-7xl gap-10 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Our story
            </p>
            <h2 id="story-heading" className="section-title mt-2">
              Elevate your experience
            </h2>
            <p className="mt-5 max-w-xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              DIME Industries makes award-winning vapes, gummies, softgels, and prerolls. We engineer our own
              hardware instead of buying generic parts — so the product in your hand matches the standard on the
              shelf.
            </p>
            <p className="mt-4 max-w-xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              Innovation takes center stage. Our commitment to excellence has earned recognition across leading
              industry publications — explore the lineup to see why we&apos;re award-winning.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-8 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
            {[
              { label: "Founded", value: "2016" },
              { label: "Awards", value: "100+" },
              { label: "Markets", value: "CA · MA" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  {stat.label}
                </dt>
                <dd className="mt-2 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.06em] text-[var(--color-resin)] sm:text-[var(--scale-2xl)]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section
        aria-labelledby="pillars-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <Reveal>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              How we work
            </p>
            <h2 id="pillars-heading" className="section-title mt-2">
              Built to a higher bar
            </h2>
            <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Three commitments that shape every product we ship.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {PILLARS.map((pillar) => (
              <StaggerItem key={pillar.title} as="li" className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{pillar.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section aria-labelledby="awards-heading" className="relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <Image
            src="/brand/awards-medals.webp"
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/55" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="section-eyebrow">Recognition</p>
            <h2 id="awards-heading" className="section-title mt-3 text-white">
              Award-winning products
            </h2>
            <p className="mt-5 max-w-lg text-[var(--scale-base)] leading-relaxed text-white/75">
              From hardware trophies to product medals — the industry keeps score. We keep shipping the work that
              earns it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">
                Explore the lineup
              </Link>
              <Link href="/lab-results" className="btn-outline-light">
                Lab results
              </Link>
            </div>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-3" staggerDelay={0.08}>
            {GALLERY.map((shot) => (
              <StaggerItem
                key={shot.src}
                className={`group relative overflow-hidden ${shot.className}`}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section
        aria-labelledby="where-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <Reveal>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Where we sell
            </p>
            <h2 id="where-heading" className="section-title mt-2">
              Find your market
            </h2>
            <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Shop online for delivery in California and Massachusetts — or locate a neighborhood retailer nationwide.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-2" role="list">
            <StaggerItem as="li" className="bg-[var(--color-surface)] p-6 sm:p-8">
              <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                Shop online
              </h3>
              <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                Licensed delivery in California and Massachusetts. Browse the full catalog of vapes, edibles, and
                prerolls.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
              >
                Shop now →
              </Link>
            </StaggerItem>
            <StaggerItem as="li" className="bg-[var(--color-surface)] p-6 sm:p-8">
              <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                Find DIME
              </h3>
              <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                Neighborhood retailers across the country. Search by state and pick up where you already shop.
              </p>
              <Link
                href="/locations"
                className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
              >
                Find a store →
              </Link>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <Reveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Authenticity
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Verify every product you buy
            </p>
          </div>
          <Link href="/validate" className="btn-primary shrink-0">
            Validate
          </Link>
        </Reveal>
      </section>
    </>
  );
}
