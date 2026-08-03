// components/seo/age-gate-seo-teaser.tsx
// Compliance-safe SSR teaser for unverified visitors / crawlers — no products or pricing.
import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About DIME" },
  { href: "/glossary", label: "Glossary" },
  { href: "/trust", label: "Trust" },
  { href: "/blog", label: "Blog" },
  { href: "/locations", label: "Find DIME" },
  { href: "/faq", label: "FAQ" },
  { href: "/lab-results", label: "Lab results" },
  { href: "/validate", label: "Validate" },
] as const;

export function AgeGateSeoTeaser({
  title = "DIME Industries",
  description = "Award-winning cannabis vapes, edibles, and prerolls — engineered hardware and lab-tested extracts since 2016. Confirm you are 21+ (or a qualifying patient) to browse the full catalog.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section
      aria-label="About DIME Industries"
      className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-[var(--container-pad-x)] py-14"
    >
      <div className="mx-auto max-w-3xl">
        <p className="section-eyebrow text-[var(--color-resin)]">DIME Industries</p>
        <h1 className="mt-3 font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.06em] text-[var(--color-ink)] sm:text-[var(--scale-3xl)]">
          {title}
        </h1>
        <p className="mt-4 text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
          {description}
        </p>
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3" role="list">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
          Catalog browsing, pricing, and checkout require age verification. Educational pages above remain
          available.
        </p>
      </div>
    </section>
  );
}
