// app/trust/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AnswerCapsule } from "@/components/seo/answer-capsule";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { TRUST_PILLARS } from "@/lib/seo/geo-content";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Trust & Quality",
  description:
    "How DIME Industries earns trust: licensed markets, lab-tested COAs, product validation, engineered hardware, and award-winning standards since 2016.",
  alternates: { canonical: "/trust" },
};

export default function TrustPage() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Trust & Quality", path: "/trust" },
  ]);

  return (
    <>
      <JsonLdScript data={breadcrumbs} />

      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-12 lg:py-16">
          <p className="section-eyebrow">E-E-A-T</p>
          <h1 className="section-title mt-2">Trust &amp; quality at DIME</h1>
          <AnswerCapsule className="mt-6">
            DIME Industries is a licensed cannabis brand (est. 2016) that publishes lab results,
            offers official product validation, engineers its own hardware, and sells only through
            licensed channels for adults 21+ or qualifying patients.
          </AnswerCapsule>
          <p className="mt-4 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            Use this page as the trust hub for authenticity, testing, and shopping signals. For
            company story and awards, see{" "}
            <Link href="/about" className="text-[var(--color-resin)] hover:underline">
              About DIME Industries
            </Link>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="pillars-heading" className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <h2 id="pillars-heading" className="section-title">
            What we stand behind
          </h2>
          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-2" role="list">
            {TRUST_PILLARS.map((pillar) => (
              <li key={pillar.title} className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                  {pillar.body}
                </p>
                <Link
                  href={pillar.href}
                  className="mt-5 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:underline"
                >
                  {pillar.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="credentials-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <h2 id="credentials-heading" className="section-title">
            Credentials &amp; signals
          </h2>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                Licensing
              </dt>
              <dd className="mt-2 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                Products are sold under cannabis licensing rules in participating U.S. markets.
                Availability and formats vary by state — start at{" "}
                <Link href="/locations" className="text-[var(--color-resin)] hover:underline">
                  Find DIME
                </Link>
                .
              </dd>
            </div>
            <div>
              <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                Testing
              </dt>
              <dd className="mt-2 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                Batch-level lab data lives on{" "}
                <Link href="/lab-results" className="text-[var(--color-resin)] hover:underline">
                  Lab Results
                </Link>
                . Definitions:{" "}
                <Link href="/glossary#coa" className="text-[var(--color-resin)] hover:underline">
                  COA in the glossary
                </Link>
                .
              </dd>
            </div>
            <div>
              <dt className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                Reviews
              </dt>
              <dd className="mt-2 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                Approved customer reviews appear on product pages with AggregateRating / Review
                schema where available.
              </dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/facts" className="btn-primary">
              Brand facts
            </Link>
            <Link href="/glossary" className="btn-outline">
              Glossary
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
