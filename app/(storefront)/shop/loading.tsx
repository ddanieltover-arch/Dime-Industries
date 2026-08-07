// app/(storefront)/shop/loading.tsx
export default function ShopLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-10 lg:py-14"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading shop catalog</span>
      <div className="border-b border-[var(--color-border)] pb-8">
        <div className="h-3 w-16 animate-pulse bg-[var(--color-surface)]" />
        <div className="mt-3 h-8 w-48 animate-pulse bg-[var(--color-surface)]" />
        <div className="mt-3 h-4 w-72 max-w-full animate-pulse bg-[var(--color-surface)]" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_1fr]">
        <div className="hidden space-y-6 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 animate-pulse bg-[var(--color-surface)]" />
              <div className="h-8 animate-pulse bg-[var(--color-surface)]" />
              <div className="h-8 animate-pulse bg-[var(--color-surface)]" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse bg-[var(--color-surface)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
