// components/home/validate-products.tsx
import Image from "next/image";
import Link from "next/link";

export function ValidateProducts({
  headline = "Verify your products",
  body = "Protect against counterfeits. Verify and register your DIME product for warranty support — and earn rewards when you scan in the app.",
  ctaLabel = "Validate now",
  ctaHref = "/validate",
}: {
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
} = {}) {
  return (
    <section aria-labelledby="validate-heading" className="section-pad bg-[var(--color-bg)]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-[var(--container-pad-x)] lg:grid-cols-2">
        <div className="relative aspect-[4/3] min-h-[240px] overflow-hidden bg-[var(--color-surface)] sm:min-h-[320px]">
          <Image
            src="/brand/validate.png"
            alt="Validate your DIME products"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Authenticity
          </p>
          <h2 id="validate-heading" className="section-title mt-2">
            {headline}
          </h2>
          <p className="mt-5 max-w-lg text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            {body}
          </p>
          <Link href={ctaHref} className="btn-primary mt-8">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
