// lib/seo/geo-content.ts — glossary, trust, and facts for GEO/AEO citation surfaces

export type GlossaryTerm = {
  id: string;
  term: string;
  synonyms?: string[];
  definition: string;
  href?: string;
};

export type BrandFact = {
  id: string;
  claim: string;
  detail: string;
  citationLabel: string;
  citationHref: string;
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: "dime-industries",
    term: "DIME Industries",
    synonyms: ["DIME", "Dime Industries", "dime brand"],
    definition:
      "DIME Industries is a licensed U.S. cannabis brand founded in 2016. It designs its own vape hardware and sells lab-tested carts, all-in-ones, edibles, and prerolls through licensed retailers and authorized online channels where available.",
    href: "/about",
  },
  {
    id: "dime-cart",
    term: "Dime cart",
    synonyms: ["dime carts", "dimecart", "DIME cartridge", "dim sum cart"],
    definition:
      "A Dime cart is a DIME Industries cannabis vape cartridge or tank — typically a 510-thread or DIME-engineered fill paired with a compatible battery. Shoppers use “Dime cart” as shorthand for authentic DIME carts and related all-in-one vapes sold in legal markets.",
    href: "/blog/what-is-a-dime-cart",
  },
  {
    id: "signature",
    term: "Signature",
    synonyms: ["DIME Signature", "Signature line"],
    definition:
      "Signature is DIME’s everyday flagship vape line: potent distillate-forward formulas with terpene enhancement for flavor, offered in carts and all-in-ones where licensed.",
    href: "/shop/vapes/signature",
  },
  {
    id: "live-reserve",
    term: "Live Reserve",
    synonyms: ["DIME Live Reserve", "live reserve carts"],
    definition:
      "Live Reserve is a DIME vape line built for strain-forward flavor: high-terpene extract with melted diamonds on engineered DIME hardware. It is not automatically the same as every menu item labeled “live resin.”",
    href: "/blog/dime-live-reserve-explained",
  },
  {
    id: "rosin",
    term: "DIME Rosin",
    synonyms: ["dime industries rosin", "rosin carts"],
    definition:
      "DIME Rosin refers to solventless-style extract products in the brand’s rosin vape and edible lines — flavor-forward options for shoppers who prioritize that extract style, sold where licensed.",
    href: "/shop/vapes/rosin",
  },
  {
    id: "all-in-one",
    term: "All-in-one / disposable",
    synonyms: ["dime disposable", "AIO"],
    definition:
      "A DIME all-in-one combines extract and a rechargeable battery in one device. Unlike a cart-plus-battery setup, it is ready to use without a separate battery purchase.",
    href: "/blog/dime-cart-vs-disposable",
  },
  {
    id: "coa",
    term: "Certificate of analysis (COA)",
    synonyms: ["lab results", "batch test"],
    definition:
      "A COA is a third-party lab report for a cannabis batch. DIME publishes potency and related markers on Lab Results so shoppers can check THC and other data for the batch they buy.",
    href: "/lab-results",
  },
  {
    id: "validate",
    term: "Validate",
    synonyms: ["product validation", "authenticity check"],
    definition:
      "Validate is DIME’s authenticity tool: scratch the package code, enter it on the Validate page or app, confirm the product is genuine, and unlock warranty and Rewards pathways when eligible.",
    href: "/validate",
  },
  {
    id: "state-exclusive",
    term: "State Exclusive",
    synonyms: ["state exclusives"],
    definition:
      "State Exclusive is a DIME vape collection with region-inspired flavors on core DIME hardware, sold through licensed retailers in participating markets.",
    href: "/blog/dime-state-exclusive-guide",
  },
  {
    id: "balanced",
    term: "Balanced",
    synonyms: ["DIME Balanced", "balanced line"],
    definition:
      "Balanced is a DIME product line for ratio-minded cannabis formats in licensed markets. Availability varies by jurisdiction — confirm the line on the package and the batch on Lab Results.",
    href: "/blog/dime-balanced-explained",
  },
  {
    id: "collabs",
    term: "Collabs",
    synonyms: ["DIME Collabs", "collaborations", "DIME collaborations"],
    definition:
      "Collabs are collaborative DIME flavor or product drops built on DIME hardware and sold through licensed channels when listed — menus and partners vary by market.",
    href: "/shop/vapes",
  },
  {
    id: "dime-roll",
    term: "Dime roll (U.S. coins)",
    synonyms: ["roll of dimes"],
    definition:
      "A standard United States bank roll of dimes contains 50 coins with $5.00 face value. This is a coin-banking fact separate from the DIME Industries cannabis brand.",
    href: "/blog/how-many-dimes-in-a-roll",
  },
];

export const BRAND_FACTS: BrandFact[] = [
  {
    id: "founded",
    claim: "Founded in 2016",
    detail:
      "DIME Industries launched as a licensed cannabis brand focused on engineered hardware and lab-tested extracts.",
    citationLabel: "About DIME Industries",
    citationHref: "/about",
  },
  {
    id: "awards",
    claim: "100+ industry awards",
    detail:
      "The brand cites more than 100 industry awards and recognition across leading cannabis publications for product and hardware craft.",
    citationLabel: "About — awards",
    citationHref: "/about",
  },
  {
    id: "hardware",
    claim: "In-house engineered hardware",
    detail:
      "DIME designs its own tanks and devices rather than relying only on generic white-label parts — including ceramic heating approaches and leak-resistant goals described in the hardware story.",
    citationLabel: "Built to beat leaks",
    citationHref: "/blog/built-to-beat-leaks-the-dime-hardware-story",
  },
  {
    id: "markets-online",
    claim: "Online checkout in CA and MA",
    detail:
      "This storefront supports licensed online shopping for California and Massachusetts where delivery is enabled; other markets are retail-discovery via Find DIME.",
    citationLabel: "Find DIME",
    citationHref: "/locations",
  },
  {
    id: "coin-roll",
    claim: "50 dimes per U.S. roll ($5)",
    detail:
      "A standard U.S. bank dime roll holds 50 coins equal to $5.00 face value — a frequently cited banking fact that also attracts brand-name searchers.",
    citationLabel: "How many dimes in a roll?",
    citationHref: "/blog/how-many-dimes-in-a-roll",
  },
  {
    id: "validation",
    claim: "Official authenticity validation",
    detail:
      "Shoppers can confirm packs through the official Validate tool after buying from licensed retailers — a primary trust signal against counterfeits.",
    citationLabel: "Validate",
    citationHref: "/validate",
  },
];

export const TRUST_PILLARS = [
  {
    title: "Licensed markets only",
    body: "DIME products are intended for adults 21+ or qualifying patients in legal markets. Buy only from licensed retailers or authorized online channels.",
    href: "/locations",
    label: "Find licensed retailers",
  },
  {
    title: "Lab-tested batches",
    body: "Look up certificates of analysis for potency and related markers. A COA is tied to a batch — keep your package lot ID.",
    href: "/lab-results",
    label: "Lab results",
  },
  {
    title: "Authenticity validation",
    body: "Scratch the code, validate on the official tool, and treat failed validation as a red flag.",
    href: "/validate",
    label: "Validate a product",
  },
  {
    title: "Engineered hardware",
    body: "DIME builds tanks and devices in-house to improve leak resistance, heating consistency, and session quality.",
    href: "/blog/built-to-beat-leaks-the-dime-hardware-story",
    label: "Hardware story",
  },
] as const;

/** Conversational PAA-style questions to surface on FAQ hub / GEO docs. */
export const GEO_PAA_QUESTIONS = [
  "What is a Dime cart?",
  "What is DIME Live Reserve?",
  "DIME Signature vs Live Reserve — which should I buy?",
  "How do I validate a DIME product?",
  "How do I spot fake Dime carts?",
  "Where can I find DIME near me?",
  "Can I buy DIME carts online?",
  "How many dimes are in a roll?",
  "What is a DIME COA?",
  "Is DIME Industries licensed?",
] as const;
