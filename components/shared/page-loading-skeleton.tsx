// components/shared/page-loading-skeleton.tsx
type Variant = "page" | "home" | "account" | "checkout";

/**
 * Instant soft-nav feedback while RSC streams. Chrome stays mounted in
 * `(storefront)/layout` — only `<main>` swaps to these skeletons.
 */
export function PageLoadingSkeleton({
  variant = "page",
  label = "Loading DIME…",
}: {
  variant?: Variant;
  label?: string;
}) {
  if (variant === "home") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-12"
      >
        <span className="sr-only">{label}</span>
        <div className="h-[70vh] min-h-[28rem] animate-pulse bg-[var(--color-surface)]" />
        <div className="mt-10 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse bg-[var(--color-surface)]" />
          ))}
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse bg-[var(--color-surface)]" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "account") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="mx-auto max-w-5xl px-[var(--container-pad-x)] pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-8 sm:py-10"
      >
        <span className="sr-only">{label}</span>
        <div className="h-3 w-28 animate-pulse bg-[var(--color-surface)]" />
        <div className="mt-3 h-9 w-64 max-w-full animate-pulse bg-[var(--color-surface)]" />
        <div className="mt-8 flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 shrink-0 animate-pulse bg-[var(--color-surface)]" />
          ))}
        </div>
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-[var(--color-surface)]" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "checkout") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-10 lg:py-14"
      >
        <span className="sr-only">{label}</span>
        <div className="h-8 w-40 animate-pulse bg-[var(--color-surface)]" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-[var(--color-surface)]" />
            ))}
          </div>
          <div className="h-64 animate-pulse bg-[var(--color-surface)]" />
        </div>
      </div>
    );
  }

  // Default marketing / content page — thin so secondary routes feel snappy.
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-10 lg:py-14"
    >
      <span className="sr-only">{label}</span>
      <div className="h-3 w-20 animate-pulse bg-[var(--color-surface)]" />
      <div className="mt-4 h-10 w-[min(100%,20rem)] animate-pulse bg-[var(--color-surface)]" />
      <div className="mt-4 max-w-2xl space-y-3">
        <div className="h-4 w-full animate-pulse bg-[var(--color-surface)]" />
        <div className="h-4 w-5/6 animate-pulse bg-[var(--color-surface)]" />
        <div className="h-4 w-4/6 animate-pulse bg-[var(--color-surface)]" />
      </div>
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse bg-[var(--color-surface)]" />
        ))}
      </div>
    </div>
  );
}
