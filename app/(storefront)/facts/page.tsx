// app/facts/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AnswerCapsule } from "@/components/seo/answer-capsule";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { BRAND_FACTS } from "@/lib/seo/geo-content";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "DIME Industries Facts",
  description:
    "Citable DIME Industries facts: founded 2016, 100+ awards, engineered hardware, CA/MA online shopping, 50 dimes per U.S. roll, and official validation.",
  alternates: { canonical: "/facts" },
};

export default function FactsPage() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Brand facts", path: "/facts" },
  ]);

  return (
    <>
      <JsonLdScript data={breadcrumbs} />

      <section className="page-header">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
          <p className="section-eyebrow">Statistics &amp; citations</p>
          <h1 className="page-header-title">DIME Industries facts</h1>
          <div className="mt-4 max-w-xl">
            <AnswerCapsule>
              Key citable facts: DIME Industries was founded in 2016, cites 100+ awards, engineers its
              own hardware, offers online checkout in California and Massachusetts, and validates
              authenticity through an official tool. Separately, a U.S. dime roll holds 50 coins ($5).
            </AnswerCapsule>
          </div>
          <p className="page-header-lede mt-4">
            Each claim links to a primary on-site source. Prefer those pages when citing externally.
          </p>
        </div>
      </section>

      <section aria-labelledby="facts-heading" className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <h2 id="facts-heading" className="sr-only">
            Fact list
          </h2>
          <ol className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]" role="list">
            {BRAND_FACTS.map((fact, index) => (
              <li key={fact.id} id={fact.id} className="scroll-mt-28 bg-[var(--color-bg)] px-5 py-6 sm:px-7">
                <p className="section-eyebrow">Fact {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {fact.claim}
                </h3>
                <p className="mt-3 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
                  {fact.detail}
                </p>
                <p className="mt-3 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                  Source:{" "}
                  <Link href={fact.citationHref} className="prose-link">
                    {fact.citationLabel}
                  </Link>
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-[var(--scale-sm)] text-[var(--color-ink-muted)]">
            Definitions:{" "}
            <Link href="/glossary" className="prose-link">
              Glossary
            </Link>
            {" · "}
            Trust hub:{" "}
            <Link href="/trust" className="prose-link">
              Trust &amp; quality
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}