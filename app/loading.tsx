// app/loading.tsx
export default function HomeLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-12"
    >
      <span className="sr-only">Loading DIME…</span>
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
      <div className="mt-10 flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 w-64 shrink-0 animate-pulse bg-[var(--color-surface)]" />
        ))}
      </div>
    </div>
  );
}
