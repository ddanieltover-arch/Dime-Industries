// app/loading.tsx
export default function HomeLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <span className="sr-only">Loading DIME…</span>
      <div className="h-72 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface)]" />
      <div className="mt-8 h-6 w-40 animate-pulse rounded bg-[var(--color-surface)]" />
      <div className="mt-4 flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 w-64 shrink-0 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface)]" />
        ))}
      </div>
    </div>
  );
}
