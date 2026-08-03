// components/seo/outbound-citations.tsx
import type { OutboundCitation } from "@/lib/seo/outbound-citations";

/** Renders 2–3 related external citations (noopener) under inbound SEO pages. */
export function OutboundCitations({
  citations,
  heading = "Related references",
}: {
  citations: readonly OutboundCitation[];
  heading?: string;
}) {
  if (!citations.length) return null;
  return (
    <aside
      className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      aria-label={heading}
    >
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
        {heading}
      </p>
      <ul className="mt-4 space-y-3" role="list">
        {citations.slice(0, 3).map((c) => (
          <li key={c.href}>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.06em] text-[var(--color-ink)] transition-colors hover:text-[var(--color-resin)]"
            >
              {c.label} ↗
            </a>
            <p className="mt-1 text-[var(--scale-xs)] leading-relaxed text-[var(--color-ink-soft)]">
              {c.note}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
