// components/home/promo-banner.tsx
import Link from "next/link";
import type { HomepageBanner } from "@/lib/cms/types";

export function PromoBanner({ banner }: { banner: HomepageBanner }) {
  if (!banner.enabled) return null;
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-[var(--container-pad-x)] py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[var(--font-display)] text-[var(--scale-base)] uppercase tracking-[0.08em] text-[var(--color-ink)] sm:text-[var(--scale-lg)]">
            {banner.headline}
          </h2>
          <p className="mt-1 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">{banner.body}</p>
        </div>
        <Link href={banner.ctaHref} className="btn-primary shrink-0 self-start sm:self-auto">
          {banner.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
