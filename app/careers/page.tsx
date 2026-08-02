// app/careers/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Build with DIME — join a licensed cannabis brand focused on craft hardware, compliance, and brand excellence.",
  alternates: { canonical: "/careers" },
};

const SUPPORT = "sales@dimeindustries.us";

const VALUES = [
  {
    title: "Clear ownership",
    body: "Know what you own, ship it with pride, and leave the work better than you found it.",
  },
  {
    title: "Quality over shortcuts",
    body: "Lab-tested standards apply to how we work too — no cutting corners on product or process.",
  },
  {
    title: "Regulated-market respect",
    body: "We operate where the rules matter. Compliance isn’t a blocker — it’s part of the craft.",
  },
] as const;

export default function CareersPage() {
  return (
    <>
      <section className="relative isolate min-h-[min(72vh,640px)] overflow-hidden">
        <Image
          src="/brand/awards.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="media-veil absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(201,177,56,0.16),transparent_50%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-14 pt-28 sm:pb-20 sm:pt-32">
          <p className="section-eyebrow careers-rise">DIME</p>
          <h1 className="careers-rise mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,4rem)] uppercase leading-[0.95] tracking-[0.06em] text-white [animation-delay:80ms]">
            Careers
          </h1>
          <p className="careers-rise mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80 [animation-delay:140ms]">
            Join DIME Industries — award-winning cannabis hardware and products, built with craft, compliance, and brand excellence.
          </p>
          <div className="careers-rise mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
            <a href={`mailto:${SUPPORT}?subject=Careers%20inquiry`} className="btn-primary">
              Apply now
            </a>
            <Link href="/about" className="btn-outline-light">
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="build-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Open invitation
          </p>
          <h2 id="build-heading" className="section-title mt-2">
            Build with DIME
          </h2>
          <p className="mt-5 max-w-2xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            We&apos;re always looking for people who care about craft hardware, compliance, and brand excellence —
            whether that&apos;s product, operations, creative, or the systems that keep a regulated brand sharp.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="culture-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Culture
          </p>
          <h2 id="culture-heading" className="section-title mt-2">
            How we work
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            The same standards we put on every batch apply to the team behind it.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {VALUES.map((value) => (
              <li key={value.title} className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {value.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">{value.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="apply-heading" className="bg-[var(--color-bg)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              How to apply
            </p>
            <h2 id="apply-heading" className="section-title mt-2">
              Send your intro
            </h2>
            <p className="mt-5 max-w-xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              Email a short intro and resume to{" "}
              <a
                href={`mailto:${SUPPORT}`}
                className="text-[var(--color-ink)] underline-offset-4 hover:underline"
              >
                {SUPPORT}
              </a>{" "}
              with the role you&apos;re interested in. Tell us what you build and why DIME fits.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${SUPPORT}?subject=Careers%20inquiry`} className="btn-primary">
                Email careers
              </a>
              <Link href="/contact" className="btn-outline">
                Contact form
              </Link>
            </div>
          </div>

          <aside className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              What to include
            </p>
            <ul className="mt-5 space-y-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]" role="list">
              <li className="flex gap-3">
                <span className="font-[var(--font-display)] text-[var(--color-resin)]" aria-hidden>
                  01
                </span>
                <span>A short intro — who you are and what you want to work on</span>
              </li>
              <li className="flex gap-3">
                <span className="font-[var(--font-display)] text-[var(--color-resin)]" aria-hidden>
                  02
                </span>
                <span>Your resume or a link to relevant work</span>
              </li>
              <li className="flex gap-3">
                <span className="font-[var(--font-display)] text-[var(--color-resin)]" aria-hidden>
                  03
                </span>
                <span>The role or discipline you&apos;re targeting</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Partner with DIME
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Looking for wholesale instead?
            </p>
          </div>
          <Link href="/wholesale" className="btn-primary shrink-0">
            Apply wholesale
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes careers-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .careers-rise {
          animation: careers-rise 0.7s var(--ease-out) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .careers-rise { animation: none !important; }
        }
      `}</style>
    </>
  );
}
