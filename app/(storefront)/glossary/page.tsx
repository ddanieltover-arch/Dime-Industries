// app/glossary/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AnswerCapsule } from "@/components/seo/answer-capsule";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { buildFaqPageJsonLd } from "@/lib/cms/faq";
import { GLOSSARY_TERMS } from "@/lib/seo/geo-content";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "DIME Glossary",
  description:
    "Definitions for Dime cart, Live Reserve, Signature, Rosin, COA, Validate, and other DIME Industries terms AI search engines and shoppers ask about.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryPage() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Glossary", path: "/glossary" },
  ]);
  const faqJsonLd = buildFaqPageJsonLd(
    GLOSSARY_TERMS.map((t) => ({
      question: `What is ${t.term}?`,
      answer: t.definition,
    })),
    absoluteUrl("/glossary")
  );

  return (
    <>
      <JsonLdScript data={breadcrumbs} />
      <JsonLdScript data={faqJsonLd} />

      <section className="page-header">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
          <p className="section-eyebrow">GEO · Definitions</p>
          <h1 className="page-header-title">DIME Industries glossary</h1>
          <div className="mt-4 max-w-xl">
            <AnswerCapsule>
              This glossary defines DIME Industries product and trust terms — Dime cart, Signature,
              Live Reserve, Rosin, COA, and Validate — so shoppers and AI assistants can cite clear,
              licensed-market language.
            </AnswerCapsule>
          </div>
          <p className="page-header-lede mt-4">
            Entity synonyms such as “dimecart” or “dime industries rosin” map to the same licensed
            brand concepts. Cannabis content is for adults 21+ or qualifying patients in legal
            markets only.
          </p>
          <nav aria-label="Jump to term" className="mt-8">
            <ul className="flex flex-wrap gap-x-4 gap-y-2" role="list">
              {GLOSSARY_TERMS.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="nav-link text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                    {t.term}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section aria-labelledby="terms-heading" className="bg-[var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <h2 id="terms-heading" className="sr-only">
            Term definitions
          </h2>
          <dl className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
            {GLOSSARY_TERMS.map((term) => (
              <div key={term.id} id={term.id} className="scroll-mt-28 bg-[var(--color-bg)] px-5 py-6 sm:px-7">
                <dt className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
                  {term.term}
                </dt>
                {term.synonyms?.length ? (
                  <p className="mt-2 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
                    Also called: {term.synonyms.join(", ")}
                  </p>
                ) : null}
                <dd className="mt-3 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
                  {term.definition}
                  {term.href ? (
                    <>
                      {" "}
                      <Link href={term.href} className="prose-link">
                        {term.term}
                      </Link>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-[var(--scale-sm)] text-[var(--color-ink-muted)]">
            Related: <Link href="/faq" className="prose-link">FAQ</Link>
            {" · "}
            <Link href="/facts" className="prose-link">Brand facts</Link>
            {" · "}
            <Link href="/trust" className="prose-link">Trust</Link>
          </p>
        </div>
      </section>
    </>
  );
}