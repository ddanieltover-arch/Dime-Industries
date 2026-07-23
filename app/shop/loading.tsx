// app/shop/loading.tsx
export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <div className="h-10 w-40 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface)]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface)]"
          />
        ))}
      </div>
      <span className="sr-only">Loading shop catalog</span>
    </div>
  );
}
