// components/home/store-locator-teaser.tsx
import Link from "next/link";
import { Reveal } from "@/components/motion";

export function StoreLocatorTeaser({
  headline = "Walk.Run.Drive.",
  body = "Find a neighborhood retailer that stocks DIME near you.",
  ctaLabel = "Find DIME",
  ctaHref = "/locations",
}: {
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
} = {}) {
  return (
    <section
      aria-labelledby="locator-heading"
      className="relative overflow-hidden"
      style={{
        backgroundImage: "url(/brand/concrete.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/78" />
      <Reveal className="relative mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)] text-center">
        <h2
          id="locator-heading"
          className="font-[var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-[0.14em] text-white"
        >
          {headline}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[var(--scale-base)] text-white/75">{body}</p>
        <Link href={ctaHref} className="btn-outline mt-8 min-h-12 w-full max-w-xs touch-manipulation sm:w-auto">
          {ctaLabel}
        </Link>
      </Reveal>
    </section>
  );
}
