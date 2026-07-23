// app/page.tsx
import type { Metadata } from "next";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getFeaturedProductLines } from "@/lib/data/products";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { HeroVideo } from "@/components/home/hero-video";
import { CategorySpotlight } from "@/components/home/category-spotlight";
import { ElevateAwards } from "@/components/home/elevate-awards";
import { ProductLineRail } from "@/components/home/product-line-rail";
import { StoreLocatorTeaser } from "@/components/home/store-locator-teaser";
import { ValidateProducts } from "@/components/home/validate-products";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import { PromoBanner } from "@/components/home/promo-banner";
import { getHomepageBanner } from "@/lib/cms/store";

export const metadata: Metadata = {
  title: "Buy THC Edibles & Vapes Online",
  description:
    "Shop award-winning DIME vapes, edibles, and prerolls. Lab-tested. Licensed in California and Massachusetts.",
  alternates: { canonical: "/" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DIME Industries",
  url: "https://dimeindustries.us",
  description: "Award-winning cannabis products sold under license in California and Massachusetts.",
};

export default async function HomePage() {
  const ageGate = await getAgeGateState();

  // Compliance-critical: do not fetch or ship real product/pricing data to
  // an unverified visitor. Gate clears via cookie + server refresh.
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
        <div className="min-h-[70vh] bg-black" aria-hidden="true" />
      ) : (
        <>
          <HeroVideo />
          {banner ? <PromoBanner banner={banner} /> : null}
          <CategorySpotlight />
          <ElevateAwards />
          {productLines.map((section) => (
            <ProductLineRail key={section.slug} section={section} />
          ))}
          <StoreLocatorTeaser />
          <ValidateProducts />
          <NewsletterSignup />
        </>
      )}
    </>
  );
}
