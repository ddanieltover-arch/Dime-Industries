// app/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  buildBreadcrumbJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "DIME App",
  description:
    "Tap. Scan. Start earning — validate products, climb Rewards tiers, and redeem exclusive DIME experiences in the app.",
  alternates: { canonical: "/app" },
};

const FEATURES = [
  {
    title: "Validate on the go",
    body: "Scratch, scan, and confirm authenticity from your phone — then activate limited warranty.",
  },
  {
    title: "Earn Rewards",
    body: "Claim points, complete campaigns, and climb Silver, Gold, and Rose Gold tiers.",
  },
  {
    title: "Redeem & early access",
    body: "Spend points on the DIME store, merch, and member-only drops when published.",
  },
] as const;

export default function AppMarketingPage() {
  const appJsonLd = buildSoftwareApplicationJsonLd();
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "DIME App", path: "/app" },
  ]);

  return (
    <>
      <JsonLdScript data={appJsonLd} />
      <JsonLdScript data={breadcrumbs} />

      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-16 text-center sm:py-24">
          <p className="section-eyebrow">Available on the DIME App</p>
          <h1 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] uppercase leading-[0.95] tracking-[0.06em] text-[var(--color-ink)]">
            Tap. Scan. Start earning.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
            Welcome to DIME Rewards on mobile — validate products, track loyalty points, and unlock exclusive
            products and experiences. App Store and Google Play links appear here when published; until then, use
            Rewards and Validate on the web.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/rewards" className="btn-primary">
              Open Rewards
            </Link>
            <Link href="/validate" className="btn-outline">
              Validate
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="features-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <h2 id="features-heading" className="section-title text-center">
            What the app unlocks
          </h2>
          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="bg-[var(--color-bg)] p-6 text-center sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                  {feature.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[var(--color-bg)]">
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-16 text-center">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Download
          </p>
          <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Store listings go live with the public release. Placeholder storefronts open in a new tab.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              App Store
            </a>
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Google Play
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
