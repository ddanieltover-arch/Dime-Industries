// components/catalog/catalog-pagination.tsx
import Link from "next/link";
import type { CatalogFilters } from "@/lib/catalog/types";
import { buildCatalogHref } from "@/lib/catalog/url";

function pageWindow(current: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, current - 1, current, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }
  return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
}

export function CatalogPagination({
  basePath,
  filters,
  total,
  page,
  pageSize,
}: {
  basePath: string;
  filters: CatalogFilters;
  total: number;
  page: number;
  pageSize: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 || total === 0) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label="Catalog pagination"
      className="flex flex-col items-center gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row sm:justify-between"
    >
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        Page {page} of {totalPages}
      </p>

      <ul className="flex flex-wrap items-center justify-center gap-2" role="list">
        <li>
          {page > 1 ? (
            <Link
              href={buildCatalogHref(basePath, filters, { page: page - 1 })}
              className="btn-outline px-4 py-2"
              rel="prev"
            >
              Prev
            </Link>
          ) : (
            <span className="btn-outline pointer-events-none px-4 py-2 opacity-40">Prev</span>
          )}
        </li>

        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const showEllipsis = prev != null && p - prev > 1;
          return (
            <li key={p} className="flex items-center gap-2">
              {showEllipsis ? (
                <span className="px-1 text-[var(--color-ink-muted)]" aria-hidden="true">
                  …
                </span>
              ) : null}
              <Link
                href={buildCatalogHref(basePath, filters, { page: p })}
                aria-current={p === page ? "page" : undefined}
                className={`min-w-10 px-3 py-2 text-center font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  p === page
                    ? "bg-[var(--color-resin)] text-black"
                    : "border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
                }`}
              >
                {p}
              </Link>
            </li>
          );
        })}

        <li>
          {page < totalPages ? (
            <Link
              href={buildCatalogHref(basePath, filters, { page: page + 1 })}
              className="btn-outline px-4 py-2"
              rel="next"
            >
              Next
            </Link>
          ) : (
            <span className="btn-outline pointer-events-none px-4 py-2 opacity-40">Next</span>
          )}
        </li>
      </ul>
    </nav>
  );
}
