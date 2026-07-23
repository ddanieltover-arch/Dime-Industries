// components/home/elevate-awards.tsx
import Image from "next/image";
import Link from "next/link";

export function ElevateAwards() {
  return (
    <section
      aria-labelledby="elevate-heading"
      className="relative overflow-hidden border-y border-[var(--color-border)]"
    >
      <div className="absolute inset-0">
        <Image
          src="/brand/hero-poster.jpg"
          alt=""
          fill
          className="object-cover opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="font-[var(--font-script)] text-[var(--scale-xl)] text-[var(--color-resin)] sm:text-[var(--scale-2xl)]">
            Elevate your experience
          </p>
          <h2
            id="elevate-heading"
            className="mt-3 font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.06em] text-white sm:text-[var(--scale-2xl)]"
          >
            Award winning products
          </h2>
          <p className="mt-4 max-w-lg text-[var(--scale-base)] leading-relaxed text-white/75">
            At DIME Industries, innovation takes center stage. Our unwavering commitment to excellence has
            garnered more than 30 prestigious awards and recognition in leading industry publications.
            We&apos;ve established our position as a market leader in delivering the most potent, delicious
            cannabis experience.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black transition-colors hover:bg-[var(--color-resin-hover)]"
          >
            Learn more
          </Link>
        </div>

        <div className="relative min-h-[280px] overflow-hidden lg:min-h-[360px]">
          <Image
            src="/brand/hero-poster.jpg"
            alt="DIME award-winning product lineup"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
