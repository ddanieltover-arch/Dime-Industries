// components/seo/answer-capsule.tsx
type Props = {
  children: React.ReactNode;
  label?: string;
  id?: string;
  className?: string;
};

export function AnswerCapsule({
  children,
  label = "Quick answer",
  id = "answer",
  className = "",
}: Props) {
  return (
    <aside
      id={id}
      aria-label="Quick Answer"
      className={`border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-resin)] bg-[var(--color-surface)] px-5 py-5 sm:px-6 ${className}`}
    >
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
        {label}
      </p>
      <div className="mt-3 text-[var(--scale-base)] font-semibold leading-relaxed text-[var(--color-ink)]">
        {children}
      </div>
    </aside>
  );
}
