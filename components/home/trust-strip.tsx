// components/home/trust-strip.tsx
import Link from "next/link";

const ITEMS = [
  { label: "Third-party lab tested", detail: "Every batch, every time", href: "/lab-results" },
  { label: "Licensed in CA & MA", detail: "State-regulated manufacturing", href: "/locations" },
  { label: "Verify authenticity", detail: "Scan & protect every product", href: "/validate" },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Compliance and quality assurance"
      className="border-y border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[var(--color-border)] px-[var(--container-pad-x)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {ITEMS.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            className="group px-2 py-6 text-center transition-colors hover:bg-[var(--color-surface-raised)] sm:px-6 sm:text-left"
          >
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              {it.label}
            </p>
            <p className="mt-1.5 text-[var(--scale-sm)] text-[var(--color-ink-soft)] transition-colors group-hover:text-[var(--color-ink)]">
              {it.detail}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
