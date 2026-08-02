// components/admin/admin-page-header.tsx
type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? (
          <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.04em] text-[var(--color-ink)] sm:text-[var(--scale-2xl)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
