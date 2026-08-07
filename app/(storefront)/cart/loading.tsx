// app/(storefront)/cart/loading.tsx
export default function CartLoading() {
  return (
    <div
      className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-10 lg:py-14"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading cart</span>
      <div className="h-8 w-40 animate-pulse bg-[var(--color-surface)]" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse bg-[var(--color-surface)]" />
        ))}
      </div>
      <div className="mt-8 h-12 w-full animate-pulse bg-[var(--color-surface)]" />
    </div>
  );
}
