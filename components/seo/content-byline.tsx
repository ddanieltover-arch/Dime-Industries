// components/seo/content-byline.tsx
import Link from "next/link";

/** Organization E-E-A-T byline for evergreen content (no individual author pages yet). */
export function ContentByline({
  updatedAt,
  publishedAt,
}: {
  updatedAt?: string;
  publishedAt?: string;
}) {
  const published = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const updated = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const showUpdated =
    publishedAt &&
    updatedAt &&
    new Date(updatedAt).getTime() - new Date(publishedAt).getTime() > 60_000;

  return (
    <aside
      aria-label="About the publisher"
      className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6"
    >
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
        Written by
      </p>
      <p className="mt-2 font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
        DIME Industries Editorial
      </p>
      <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
        Educational content from the DIME Industries team covering product lines, authenticity, lab
        results, and licensed-market shopping. Not medical advice. Adults 21+ or qualifying patients
        only.
      </p>
      <p className="mt-3 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
        {published ? (
          <>
            <time dateTime={publishedAt}>Published {published}</time>
            {showUpdated && updated ? (
              <>
                {" · "}
                <time dateTime={updatedAt}>Last updated {updated}</time>
              </>
            ) : null}
          </>
        ) : null}
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" role="list">
        <li>
          <Link
            href="/about"
            className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:underline"
          >
            About DIME
          </Link>
        </li>
        <li>
          <Link
            href="/trust"
            className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:underline"
          >
            Trust &amp; quality
          </Link>
        </li>
        <li>
          <Link
            href="/lab-results"
            className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] hover:underline"
          >
            Lab results
          </Link>
        </li>
      </ul>
    </aside>
  );
}
