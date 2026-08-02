// app/page.tsx
import type { Metadata } from "next";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { getFeaturedBundles, getFeaturedProductLines } from "@/lib/data/products";
import { AgeGateDialog } from "@/components/shared/age-gate-dialog";
import { HomepageSections } from "@/components/home/homepage-sections";
import { getHomepageBanner, getHomepageLayout } from "@/lib/cms/store";
import { isSectionEnabled } from "@/lib/cms/homepage-layout";
import { getCurrentProfile } from "@/lib/auth/session";
import { buildWebSiteJsonLd } from "@/lib/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Buy THC Edibles & Vapes Online",
  description:
    "Shop award-winning DIME Industries vapes, dime carts, edibles, and prerolls. Lab-tested. Licensed in California and Massachusetts.",
  alternates: { canonical: "/" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DIME Industries",
  url: SITE_URL,
  description: "Award-winning cannabis products sold under license in California and Massachusetts.",
  logo: `${SITE_URL}/brand/logo.png`,
};

const websiteJsonLd = buildWebSiteJsonLd();


export default async function HomePage() {
  const ageGate = await getAgeGateState();

  // Compliance-critical: do not fetch or ship real product/pricing data to
  // an unverified visitor. Gate clears via cookie + server refresh.
  const layout = ageGate.ageVerified ? await getHomepageLayout() : null;
  const needLines = layout ? isSectionEnabled(layout, "product-lines") : false;
  const needBundles = layout ? isSectionEnabled(layout, "bundles") : false;
  const needBanner = layout ? isSectionEnabled(layout, "banner") : false;
  const needRewards = layout ? isSectionEnabled(layout, "rewards") : false;

  const productLines = needLines ? await getFeaturedProductLines() : [];
  const bundles = needBundles ? await getFeaturedBundles() : null;
  const banner = needBanner ? await getHomepageBanner() : null;
  const profile = needRewards ? await getCurrentProfile() : null;
  const loyalty = profile
    ? await (await import("@/lib/loyalty/store")).getLoyaltyAccount(profile.email)
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <AgeGateDialog initiallyOpen={!ageGate.ageVerified} />

      {!ageGate.ageVerified || !layout ? null : (
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
