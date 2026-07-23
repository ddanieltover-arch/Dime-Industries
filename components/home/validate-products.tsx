// components/home/validate-products.tsx
import Image from "next/image";
import Link from "next/link";

export function ValidateProducts() {
  return (
    <section aria-labelledby="validate-heading" className="bg-[var(--color-bg)]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="relative min-h-[260px] overflow-hidden sm:min-h-[340px]">
          <Image
            src="/brand/validate.png"
            alt="Validate your DIME products"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <h2
            id="validate-heading"
            className="font-[var(--font-display)] text-[var(--scale-xl)] uppercase tracking-[0.08em] text-white sm:text-[var(--scale-2xl)]"
          >
            Verify your products
          </h2>
          <p className="mt-4 max-w-lg text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            Every DIME Industries product is backed by a limited &ldquo;no hassle&rdquo; warranty. Verify and
            register your product in the event there&apos;s an issue that keeps you from enjoying a session.
            Earn rewards when you scan them on the app.
          </p>
          <Link
            href="/account/validate"
            className="mt-8 inline-block rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black transition-colors hover:bg-[var(--color-resin-hover)]"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
