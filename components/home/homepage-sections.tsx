// components/home/homepage-sections.tsx
import type { HomepageBanner, HomepageLayout, HomepageSection } from "@/lib/cms/types";
import type { ProductLineSection } from "@/lib/data/products";
import { HeroVideo } from "@/components/home/hero-video";
import { PromoBanner } from "@/components/home/promo-banner";
import { TrustStrip } from "@/components/home/trust-strip";
import { CategorySpotlight } from "@/components/home/category-spotlight";
import { ElevateAwards } from "@/components/home/elevate-awards";
import { BundlesRail } from "@/components/home/bundles-rail";
import { ProductLineRail } from "@/components/home/product-line-rail";
import { RewardsTeaser } from "@/components/home/rewards-teaser";
import { StoreLocatorTeaser } from "@/components/home/store-locator-teaser";
import { ValidateProducts } from "@/components/home/validate-products";
import { NewsletterSignup } from "@/components/home/newsletter-signup";

function copyProps(section: HomepageSection) {
  return {
    headline: section.headline,
    body: section.body,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
  };
}

export function HomepageHero({ layout }: { layout: HomepageLayout }) {
  const section = layout.sections.find((s) => s.id === "hero" && s.enabled);
  if (!section) return null;
  return (
    <HeroVideo
      headline={section.headline}
      body={section.body}
      ctaLabel={section.ctaLabel}
      ctaHref={section.ctaHref}
    />
  );
}

/** Below-fold / data-heavy sections — stream after hero via Suspense. */
export function HomepageBelowFold({
  layout,
  banner,
  productLines,
  bundles,
  signedIn,
  pointsBalance,
}: {
  layout: HomepageLayout;
  banner: HomepageBanner | null;
  productLines: ProductLineSection[];
  bundles: ProductLineSection | null;
  signedIn: boolean;
  pointsBalance?: number;
}) {
  return (
    <>
      {layout.sections.map((section) => {
        if (!section.enabled || section.id === "hero") return null;

        switch (section.id) {
          case "banner":
            return banner ? <PromoBanner key={section.id} banner={banner} /> : null;
          case "trust":
            return <TrustStrip key={section.id} />;
          case "categories":
            return <CategorySpotlight key={section.id} />;
          case "awards":
            return <ElevateAwards key={section.id} />;
          case "bundles":
            return bundles ? <BundlesRail key={section.id} section={bundles} /> : null;
          case "product-lines":
            return (
              <div key={section.id}>
                {productLines.map((line) => (
                  <ProductLineRail key={line.slug} section={line} />
                ))}
              </div>
            );
          case "rewards":
            return (
              <RewardsTeaser
                key={section.id}
                signedIn={signedIn}
                pointsBalance={pointsBalance}
                {...copyProps(section)}
              />
            );
          case "locator":
            return <StoreLocatorTeaser key={section.id} {...copyProps(section)} />;
          case "validate":
            return <ValidateProducts key={section.id} {...copyProps(section)} />;
          case "newsletter":
            return (
              <NewsletterSignup
                key={section.id}
                headline={section.headline}
                body={section.body}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

/** Full homepage (hero + below-fold) — kept for tests / admin previews. */
export function HomepageSections({
  layout,
  banner,
  productLines,
  bundles,
  signedIn,
  pointsBalance,
}: {
  layout: HomepageLayout;
  banner: HomepageBanner | null;
  productLines: ProductLineSection[];
  bundles: ProductLineSection | null;
  signedIn: boolean;
  pointsBalance?: number;
}) {
  return (
    <>
      <HomepageHero layout={layout} />
      <HomepageBelowFold
        layout={layout}
        banner={banner}
        productLines={productLines}
        bundles={bundles}
        signedIn={signedIn}
        pointsBalance={pointsBalance}
      />
    </>
  );
}
