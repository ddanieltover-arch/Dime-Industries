// components/home/trust-strip.tsx
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion";

const ITEMS = [
  { label: "Third-party lab tested", detail: "COAs on pack and online", href: "/lab-results" },
  { label: "Find DIME nearby", detail: "Retailers across regulated markets", href: "/locations" },
  { label: "Validate authenticity", detail: "Scratch, verify, unlock warranty", href: "/validate" },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Compliance and quality assurance"
      className="border-y border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <Stagger
        as="div"
        className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[var(--color-border)] px-[var(--container-pad-x)] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {ITEMS.map((it) => (
          <StaggerItem key={it.label} as="div">
            <Link
              href={it.href}
              className="group relative block min-h-[4.5rem] px-2 py-6 text-center transition-colors hover:bg-[var(--color-surface-raised)] sm:px-6 sm:text-left"
            >
              <span
                className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-[var(--color-resin)] transition-transform duration-[var(--motion-base)] ease-[var(--ease-out)] group-hover:scale-x-100 sm:inset-x-6"
                aria-hidden="true"
              />
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                {it.label}
              </p>
              <p className="mt-1.5 text-[var(--scale-sm)] text-[var(--color-ink-soft)] transition-colors group-hover:text-[var(--color-ink)]">
                {it.detail}
              </p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
