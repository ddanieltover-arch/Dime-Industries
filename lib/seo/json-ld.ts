// lib/seo/json-ld.ts — shared JSON-LD builders for public pages
import { absoluteUrl, SITE_URL } from "@/lib/seo/site";

export type BreadcrumbItem = { name: string; path: string };

export type HowToStep = { name: string; text: string };

export type ProductOfferInput = {
  name: string;
  description: string;
  slug: string;
  sku: string;
  imageUrl?: string | null;
  priceCents: number;
  inStock: boolean;
  brandName?: string;
  aggregateRating?: { ratingValue: number; reviewCount: number } | null;
  reviews?: { authorName: string; rating: number; body: string; datePublished?: string }[];
};

/** Verified public brand profiles for Organization.sameAs (do not invent handles). */
export const ORGANIZATION_SAME_AS = [
  "https://dimeindustries.com",
  "https://www.instagram.com/dime.industries/",
  "https://www.facebook.com/DimeIndustriesCo",
  "https://www.linkedin.com/company/dime-industries",
] as const;

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "DIME Industries",
    alternateName: ["DIME", "Dime Industries"],
    url: SITE_URL,
    description:
      "Award-winning cannabis vapes, edibles, and prerolls. Lab-tested products sold under license in legal U.S. markets.",
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/logo.png"),
    },
    image: absoluteUrl("/brand/og.png"),
    email: "sales@dimeindustries.us",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "sales@dimeindustries.us",
        availableLanguage: ["English"],
        areaServed: "US",
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "sales@dimeindustries.us",
        availableLanguage: ["English"],
        areaServed: "US",
      },
    ],
    sameAs: [...ORGANIZATION_SAME_AS],
    areaServed: [
      { "@type": "AdministrativeArea", name: "California" },
      { "@type": "AdministrativeArea", name: "Massachusetts" },
      { "@type": "AdministrativeArea", name: "Arizona" },
      { "@type": "AdministrativeArea", name: "Montana" },
      { "@type": "AdministrativeArea", name: "Nevada" },
      { "@type": "AdministrativeArea", name: "New Jersey" },
      { "@type": "AdministrativeArea", name: "New Mexico" },
      { "@type": "AdministrativeArea", name: "New York" },
      { "@type": "AdministrativeArea", name: "Oklahoma" },
    ],
    foundingDate: "2016",
  };
}

export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "DIME Industries",
    url: SITE_URL,
    description:
      "Award-winning cannabis vapes, edibles, and prerolls from DIME Industries.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBlogPostingJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
}): Record<string, unknown> {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl("/brand/og.png"),
    author: {
      "@type": "Organization",
      name: "DIME Industries",
      url: SITE_URL,
      "@id": `${SITE_URL}/#organization`,
    },
    publisher: {
      "@type": "Organization",
      name: "DIME Industries",
      url: SITE_URL,
      "@id": `${SITE_URL}/#organization`,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/logo.png"),
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };
}

export function buildHowToJsonLd(input: {
  name: string;
  description: string;
  steps: HowToStep[];
  url?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    ...(input.url ? { url: absoluteUrl(input.url) } : {}),
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function buildSoftwareApplicationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DIME App",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "iOS, Android, Web",
    description:
      "Validate DIME products, earn Rewards points, and unlock member experiences in the DIME App.",
    url: absoluteUrl("/app"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "DIME Industries",
      url: SITE_URL,
    },
  };
}

export function buildVideoObjectJsonLd(input?: {
  name?: string;
  description?: string;
  uploadDate?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input?.name ?? "DIME Industries — Elevate your experience",
    description:
      input?.description ??
      "Brand film introducing award-winning DIME Industries cannabis vapes, edibles, and prerolls.",
    thumbnailUrl: absoluteUrl("/brand/hero-poster.webp"),
    contentUrl: absoluteUrl("/brand/hero.mp4"),
    uploadDate: input?.uploadDate ?? "2026-01-01",
    publisher: {
      "@type": "Organization",
      name: "DIME Industries",
      url: SITE_URL,
    },
  };
}

export function buildProductJsonLd(input: ProductOfferInput): Record<string, unknown> {
  const url = absoluteUrl(`/product/${input.slug}`);
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    sku: input.sku,
    image: input.imageUrl ? [input.imageUrl] : [absoluteUrl("/brand/og.png")],
    brand: {
      "@type": "Brand",
      name: input.brandName ?? "DIME Industries",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (input.priceCents / 100).toFixed(2),
      availability: input.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
      seller: {
        "@type": "Organization",
        name: "DIME Industries",
        url: SITE_URL,
      },
    },
  };

  if (input.aggregateRating && input.aggregateRating.reviewCount > 0) {
    json.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.aggregateRating.ratingValue,
      reviewCount: input.aggregateRating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (input.reviews && input.reviews.length > 0) {
    json.review = input.reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.authorName || "DIME customer" },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.body,
      ...(r.datePublished ? { datePublished: r.datePublished } : {}),
    }));
  }

  return json;
}

/** Validate product flow — HowTo steps aligned with /validate page UI. */
export const VALIDATE_HOWTO_STEPS: HowToStep[] = [
  {
    name: "Scratch the code",
    text: "Find the validation panel on your package and scratch it fully so every character (or QR) is readable.",
  },
  {
    name: "Enter & verify",
    text: "Type the code on Validate — or scan with your phone when using the DIME App.",
  },
  {
    name: "Claim points & warranty",
    text: "Confirm authenticity, activate limited warranty coverage when eligible, and earn Rewards credit when you sign in.",
  },
  {
    name: "Redeem rewards",
    text: "Use points toward discounts on this storefront and exclusive perks in the DIME App when available.",
  },
];

/** Spot-fake guide HowTo — mirrors educational H2s on the blog post. */
export const SPOT_FAKE_HOWTO_STEPS: HowToStep[] = [
  {
    name: "Buy from licensed retailers only",
    text: "Start with Find DIME or the official shop in markets that sell online. Avoid social-media sellers and unlabeled delivery accounts.",
  },
  {
    name: "Validate the product",
    text: "After a licensed purchase, use the official Validate tool with the information on your package.",
  },
  {
    name: "Check packaging and price red flags",
    text: "Watch for prices far below licensed menus, sellers who cannot name a licensed shop, and packs that will not validate.",
  },
  {
    name: "Act if validation fails",
    text: "Do not assume authenticity. Contact the licensed retailer with your receipt and reach official Contact channels with package details.",
  },
];

export type LocationStateSchemaInput = {
  slug: string;
  name: string;
  code: string;
  blurb: string;
  purchasableOnline: boolean;
  cities: { name: string; lat?: number; lng?: number }[];
  stateLat?: number;
  stateLng?: number;
};

/**
 * Local SEO graph for a state page.
 * Uses Place + areaServed — not a fake storefront LocalBusiness (no consumer NAP yet).
 */
export function buildLocationStateJsonLd(input: LocationStateSchemaInput): Record<string, unknown> {
  const pageUrl = absoluteUrl(`/locations/${input.slug}`);
  const statePlaceId = `${pageUrl}#state`;
  const cityPlaces = input.cities
    .filter((c) => typeof c.lat === "number" && typeof c.lng === "number")
    .map((c) => ({
      "@type": "Place" as const,
      "@id": `${pageUrl}#${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: `${c.name}, ${input.code}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: c.name,
        addressRegion: input.code,
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: c.lat,
        longitude: c.lng,
      },
    }));

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": pageUrl,
      url: pageUrl,
      name: `Find DIME in ${input.name}`,
      description: input.blurb,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": statePlaceId },
    },
    {
      "@type": "Place",
      "@id": statePlaceId,
      name: input.name,
      address: {
        "@type": "PostalAddress",
        addressRegion: input.code,
        addressCountry: "US",
      },
      ...(typeof input.stateLat === "number" && typeof input.stateLng === "number"
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: input.stateLat,
              longitude: input.stateLng,
            },
          }
        : {}),
      containsPlace: cityPlaces.map((p) => ({ "@id": p["@id"] })),
    },
    ...cityPlaces,
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "DIME Industries",
      url: SITE_URL,
      areaServed: [{ "@id": statePlaceId }, ...cityPlaces.map((p) => ({ "@id": p["@id"] }))],
    },
  ];

  if (input.purchasableOnline) {
    graph.push({
      "@type": "OnlineStore",
      "@id": `${pageUrl}#online-store`,
      name: `DIME Industries online — ${input.name}`,
      url: absoluteUrl("/shop"),
      description: `Licensed online shopping for DIME products available in ${input.name} where delivery is enabled.`,
      areaServed: { "@id": statePlaceId },
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/** ItemList of state location pages for the Find DIME hub. */
export function buildLocationsHubJsonLd(
  states: { name: string; slug: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Find DIME near me — markets",
    itemListElement: states.map((s, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Find DIME in ${s.name}`,
      url: absoluteUrl(`/locations/${s.slug}`),
    })),
  };
}
