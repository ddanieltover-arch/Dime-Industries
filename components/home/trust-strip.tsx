// components/home/trust-strip.tsx
const ITEMS = [
  { label: "Third-party lab tested", detail: "Every batch, every time" },
  { label: "Licensed in CA & MA", detail: "State-regulated cultivation & manufacturing" },
  { label: "21+ / qualifying medical patients", detail: "Verified at entry and at checkout" },
];

export function TrustStrip() {
  return (
    <section aria-label="Compliance and quality assurance" className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
        {ITEMS.map((it) => (
          <div key={it.label} className="text-center sm:text-left">
            <p className="font-[var(--font-mono)] text-[var(--scale-xs)] uppercase tracking-wide text-[var(--color-terp)]">
              {it.label}
            </p>
            <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{it.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
