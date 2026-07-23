// components/home/promo-banner.tsx
import Link from "next/link";
import type { HomepageBanner } from "@/lib/cms/types";

export function PromoBanner({ banner }: { banner: HomepageBanner }) {
  if (!banner.enabled) return null;
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h2 className="font-[var(--font-display)] text-[var(--scale-lg)] text-[var(--color-ink)]">
            {banner.headline}
          </h2>
          <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{banner.body}</p>
        </div>
        <Link
          href={banner.ctaHref}
          className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-resin-strong)] px-4 py-2 text-center text-[var(--scale-sm)] text-[var(--color-surface)] hover:bg-[var(--color-resin-hover)]"
        >
          {banner.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
