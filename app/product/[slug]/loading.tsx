// app/product/[slug]/loading.tsx
export default function ProductLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-10 lg:py-14"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading product</span>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse bg-[var(--color-surface)]" />
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse bg-[var(--color-surface)]" />
          <div className="h-10 w-3/4 animate-pulse bg-[var(--color-surface)]" />
          <div className="h-4 w-full animate-pulse bg-[var(--color-surface)]" />
          <div className="h-4 w-5/6 animate-pulse bg-[var(--color-surface)]" />
          <div className="mt-8 h-12 w-full animate-pulse bg-[var(--color-surface)]" />
        </div>
      </div>
    </div>
  );
}
