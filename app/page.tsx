// app/page.tsx
import type { Metadata } from "next";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getFeaturedBundles, getFeaturedProductLines } from "@/lib/data/products";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { AgeGateSeoTeaser } from "@/components/seo/age-gate-seo-teaser";
import { HomepageSections } from "@/components/home/homepage-sections";
import { getHomepageBanner, getHomepageLayout } from "@/lib/cms/store";
import { isSectionEnabled } from "@/lib/cms/homepage-layout";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Buy THC Edibles & Vapes Online",
  description:
    "Shop award-winning DIME Industries vapes, dime carts, edibles, and prerolls. Lab-tested. Licensed in California and Massachusetts.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const ageGate = await getAgeGateState();

  // Compliance-critical: do not fetch or ship real product/pricing data to
  // an unverified visitor. Gate clears via cookie + server refresh.
  const layout = ageGate.ageVerified ? await getHomepageLayout() : null;
  const needLines = layout ? isSectionEnabled(layout, "product-lines") : false;
  const needBundles = layout ? isSectionEnabled(layout, "bundles") : false;
  const needBanner = layout ? isSectionEnabled(layout, "banner") : false;
  const needRewards = layout ? isSectionEnabled(layout, "rewards") : false;

  const [productLines, bundles, banner, profile] = await Promise.all([
    needLines ? getFeaturedProductLines() : Promise.resolve([]),
    needBundles ? getFeaturedBundles() : Promise.resolve(null),
    needBanner ? getHomepageBanner() : Promise.resolve(null),
    needRewards ? getCurrentProfile() : Promise.resolve(null),
  ]);

  const loyalty = profile
    ? await (await import("@/lib/loyalty/store")).getLoyaltyAccount(profile.email)
    : null;

  return (
    <>
      <AgeGateDialog initiallyOpen={!ageGate.ageVerified} />

      {!ageGate.ageVerified || !layout ? (
        !ageGate.ageVerified ? <AgeGateSeoTeaser /> : null
      ) : (
        <HomepageSections
          layout={layout}
          banner={banner}
          productLines={productLines}
          bundles={bundles}
          signedIn={Boolean(profile)}
          pointsBalance={loyalty?.pointsBalance}
        />
      )}
    </>
  );
}
