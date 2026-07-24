// app/validate/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { PublicValidateForm } from "@/components/validate/public-validate-form";

export const metadata: Metadata = {
  title: "Validate Your Products",
  description: "Verify authenticity and activate your limited DIME warranty.",
  alternates: { canonical: "/validate" },
};

export default function ValidatePage() {
  return (
    <section className="bg-[var(--color-bg)]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="relative min-h-[260px] overflow-hidden sm:min-h-[340px]">
          <Image
            src="/brand/validate.png"
            alt="Validate your DIME products"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-white">
            Verify your products
          </h1>
          <p className="mt-4 max-w-lg text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            Every DIME Industries product is backed by a limited &ldquo;no hassle&rdquo; warranty. Verify and register
            your product to confirm authenticity and unlock rewards.
          </p>
          <div className="mt-8">
            <PublicValidateForm />
          </div>
        </div>
      </div>
    </section>
  );
}
