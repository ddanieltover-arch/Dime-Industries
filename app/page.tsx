// app/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getFeaturedBundles, getFeaturedProductLines } from "@/lib/data/products";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { AgeGateSeoTeaser } from "@/components/seo/age-gate-seo-teaser";
import { HomepageBelowFold, HomepageHero } from "@/components/home/homepage-sections";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { getHomepageBanner, getHomepageLayout } from "@/lib/cms/store";
import { isSectionEnabled } from "@/lib/cms/homepage-layout";
import { getCurrentProfile } from "@/lib/auth/session";
import { buildVideoObjectJsonLd } from "@/lib/seo/json-ld";
import type { HomepageLayout } from "@/lib/cms/types";

export const metadata: Metadata = {
  title: "Buy THC Edibles & Vapes Online",
  description:
    "Shop award-winning DIME Industries vapes, dime carts, edibles, and prerolls. Lab-tested. Licensed in California and Massachusetts.",
  alternates: { canonical: "/" },
};

/** Cacheable shell — hero can stream before catalog rails resolve. */
export const revalidate = 60;

const videoJsonLd = buildVideoObjectJsonLd();

async function HomeBelowFoldLoader({ layout }: { layout: HomepageLayout }) {
  const needLines = isSectionEnabled(layout, "product-lines");
  const needBundles = isSectionEnabled(layout, "bundles");
  const needBanner = isSectionEnabled(layout, "banner");
  const needRewards = isSectionEnabled(layout, "rewards");

  const [productLines, bundles, banner, profile] = await Promise.all([
    needLines ? getFeaturedProductLines() : Promise.resolve([]),
    needBundles ? getFeaturedBundles() : Promise.resolve(null),
    needBanner ? getHomepageBanner() : Promise.resolve(null),
    needRewards ? getCurrentProfile() : Promise.resolve(null),
  ]);

  const loyalty =
    profile != null
      ? await (await import("@/lib/loyalty/store")).getLoyaltyAccount(profile.email)
      : null;

  return (
    <HomepageBelowFold
      layout={layout}
      banner={banner}
      productLines={productLines}
      bundles={bundles}
      signedIn={Boolean(profile)}
      pointsBalance={loyalty?.pointsBalance}
    />
  );
}

export default async function HomePage() {
  const ageGate = await getAgeGateState();

  // Compliance-critical: do not fetch or ship real product/pricing data to
  // an unverified visitor. Gate clears via cookie + server refresh.
  const layout = ageGate.ageVerified ? await getHomepageLayout() : null;

  return (
    <>
      <JsonLdScript data={videoJsonLd} />

      <AgeGateDialog initiallyOpen={!ageGate.ageVerified} />

      {!ageGate.ageVerified || !layout ? (
        !ageGate.ageVerified ? <AgeGateSeoTeaser /> : null
      ) : (
        <>
          {/* Hero first — LCP poster without waiting on catalog/DB rails */}
          <HomepageHero layout={layout} />
          <Suspense fallback={null}>
            <HomeBelowFoldLoader layout={layout} />
          </Suspense>
        </>
      )}
    </>
  );
}
