// app/(storefront)/(home)/page.tsx
import type { Metadata } from "next";
import { getFeaturedBundles, getFeaturedProductLines } from "@/lib/data/products";
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
  // Age-gate entry disabled (AGE_GATE_ENTRY_ENABLED) — always load homepage content.
  // No getAgeGateState() here: avoids cookie/settings I/O on the hottest browse path.
  const layout = await getHomepageLayout();
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

  const loyalty = profile
    ? await (await import("@/lib/loyalty/store")).getLoyaltyAccount(profile.email)
    : null;

  return (
    <HomepageSections
      layout={layout}
      banner={banner}
      productLines={productLines}
      bundles={bundles}
      signedIn={Boolean(profile)}
      pointsBalance={loyalty?.pointsBalance}
    />
  );
}
