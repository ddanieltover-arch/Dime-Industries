// app/faq/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildFaqPageJsonLd, FAQ_CMS_SLUG, parseFaqEntries } from "@/lib/cms/faq";
import { getCmsPage } from "@/lib/cms/store";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about DIME products, authenticity, rewards, stores, and shopping online.",
  alternates: { canonical: "/faq" },
};

const QUICK_LINKS = [
  { href: "/validate", label: "Validate" },
  { href: "/locations", label: "Find DIME" },
  { href: "/rewards", label: "Rewards" },
  { href: "/promotions", label: "Promotions" },
  { href: "/contact", label: "Contact" },
] as const;

export default async function FaqPage() {
  const page = await getCmsPage(FAQ_CMS_SLUG);
  if (!page) notFound();

  const entries = parseFaqEntries(page.body);
  const faqJsonLd = entries.length ? buildFaqPageJsonLd(entries, `${SITE_URL}/faq`) : null;

  return (
    <>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <section className="relative isolate min-h-[min(58vh,520px)] overflow-hidden">
        <Image
          src="/brand/concrete.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(14,14,14,0.94)_0%,rgba(14,14,14,0.55)_45%,rgba(14,14,14,0.4)_100%)]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(201,177,56,0.12),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(58vh,520px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-12 pt-28 sm:pb-16 sm:pt-32">
          <p className="section-eyebrow faq-rise">DIME</p>
          <h1 className="faq-rise mt-2 max-w-2xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-[0.06em] text-white [animation-delay:80ms]">
            FAQ
          </h1>
          <p className="faq-rise mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80 [animation-delay:140ms]">
            Answers about the brand, products, rewards, authenticity, and where to shop.
          </p>
          <div className="faq-rise mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
            <Link href="/contact" className="btn-primary">
              Contact support
            </Link>
            <Link href="/shop" className="btn-outline-light">
              Shop now
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-list-heading" className="bg-[var(--color-bg)]">
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Common questions
          </p>
          <h2 id="faq-list-heading" className="section-title mt-2">
            {page.title}
          </h2>
          <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Tap a question to expand. Still stuck? Reach the team anytime.
          </p>

          {entries.length > 0 ? (
            <div className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)]">
              {entries.map((entry, index) => (
                <details
                  key={entry.question}
                  className={`group px-5 py-5 sm:px-7 ${
                    index > 0 ? "border-t border-[var(--color-border)]" : ""
                  }`}
                >
                  <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      <span className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.08em] text-[var(--color-ink)] transition-colors duration-[var(--motion-fast)] group-open:text-[var(--color-resin)] sm:text-[var(--scale-lg)]">
                        {entry.question}
                      </span>
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--color-border-interactive)] font-[var(--font-display)] text-[var(--scale-sm)] text-[var(--color-ink-muted)] transition-[transform,border-color,color] duration-[var(--motion-base)] ease-[var(--ease-out)] group-open:rotate-45 group-open:border-[var(--color-resin)] group-open:text-[var(--color-resin)]"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
                    {entry.answer}
                  </p>
                </details>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              FAQ content is being updated. Contact support@dimeindustries.us for help in the meantime.
            </p>
          )}
        </div>
      </section>

      <section
        aria-labelledby="faq-links-heading"
        className="border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-12">
          <h2
            id="faq-links-heading"
            className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]"
          >
            Jump to
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3" role="list">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <style>{`
        @keyframes faq-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .faq-rise {
          animation: faq-rise 0.7s var(--ease-out) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-rise { animation: none !important; }
        }
      `}</style>
    </>
  );
}
