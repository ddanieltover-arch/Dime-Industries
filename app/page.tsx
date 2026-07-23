// app/page.tsx
import type { Metadata } from "next";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getFeaturedProductLines } from "@/lib/data/products";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { HeroBatchTicket } from "@/components/home/hero-batch-ticket";
import { PromoBanner } from "@/components/home/promo-banner";
import { TrustStrip } from "@/components/home/trust-strip";
import { ProductLineRail } from "@/components/home/product-line-rail";
import { StoreLocatorTeaser } from "@/components/home/store-locator-teaser";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import { getHomepageBanner } from "@/lib/cms/store";

export const metadata: Metadata = {
  title: "Lab-Tested Vapes, Edibles & Prerolls",
  description:
    "Shop DIME's lab-tested cannabis products by potency, strain, and format. Every batch published with its certificate of analysis. Licensed in California and Massachusetts.",
  alternates: { canonical: "/" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DIME Enterprise Commerce",
  url: "https://dimeindustries.us",
  description: "Lab-tested cannabis products sold under license in California and Massachusetts.",
};

export default async function HomePage() {
  const ageGate = await getAgeGateState();

  // Compliance-critical: do not fetch or ship real product/pricing data to
  // an unverified visitor at all — the age-gate overlay is the UX, but the
  // actual control has to hold even if JS is disabled or the overlay is
  // inspected away. An unverified request gets a neutral placeholder
  // instead of a second network round-trip once the gate clears.
  const productLines = ageGate.ageVerified ? await getFeaturedProductLines() : [];
  const banner = ageGate.ageVerified ? await getHomepageBanner() : null;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <AgeGateDialog initiallyOpen={!ageGate.ageVerified} />

      {!ageGate.ageVerified ? (
        <div aria-hidden="true" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface)]" />
        </div>
      ) : (
        <>
          <HeroBatchTicket />
          {banner ? <PromoBanner banner={banner} /> : null}
          <TrustStrip />
          {productLines.map((section) => (
            <ProductLineRail key={section.slug} section={section} />
          ))}
          <StoreLocatorTeaser />
          <NewsletterSignup />
        </>
      )}
    </>
  );
}
