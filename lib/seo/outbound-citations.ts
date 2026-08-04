// lib/seo/outbound-citations.ts — 2–3 authoritative outbound links per inbound SEO surface

export type OutboundCitation = {
  href: string;
  label: string;
  note: string;
};

const US_MINT_ROLL: OutboundCitation = {
  href: "https://www.usmint.gov/coins/coin-medal-programs/circulating-coins/dime",
  label: "U.S. Mint — Roosevelt Dime",
  note: "Official circulating-coin reference for dime specifications.",
};

const CA_CANNABIS: OutboundCitation = {
  href: "https://cannabis.ca.gov/",
  label: "California Department of Cannabis Control",
  note: "Licensed-market rules and consumer resources for California.",
};

const MA_CANNABIS: OutboundCitation = {
  href: "https://masscannabiscontrol.com/",
  label: "Massachusetts Cannabis Control Commission",
  note: "Licensed adult-use and medical cannabis information for Massachusetts.",
};

const SAMHSA: OutboundCitation = {
  href: "https://www.samhsa.gov/",
  label: "SAMHSA",
  note: "Federal behavioral-health resources (educational; not product advice).",
};

const LEAFLY_STRAIN_HUB: OutboundCitation = {
  href: "https://www.leafly.com/strains",
  label: "Leafly strain library",
  note: "Independent strain encyclopedia for genetics and naming context.",
};

const WIKI_LIVE_RESIN: OutboundCitation = {
  href: "https://en.wikipedia.org/wiki/Live_resin",
  label: "Wikipedia — Live resin",
  note: "General extract terminology (brand lines may differ).",
};

const WIKI_ROSIN: OutboundCitation = {
  href: "https://en.wikipedia.org/wiki/Rosin",
  label: "Wikipedia — Rosin",
  note: "Solventless concentrate overview for educational comparison.",
};

const FDA_VAPING: OutboundCitation = {
  href: "https://www.fda.gov/tobacco-products/products-ingredients-components/e-cigarettes-vapes-and-other-electronic-nicotine-delivery-systems-ends",
  label: "FDA — ENDS overview",
  note: "Federal device/consumer context (nicotine-focused; cannabis is state-regulated).",
};

/** Keys: blog slug, catalog path, or `product:{slug}` / `product` default */
export const OUTBOUND_BY_KEY: Record<string, readonly OutboundCitation[]> = {
  "how-many-dimes-in-a-roll": [US_MINT_ROLL, CA_CANNABIS, MA_CANNABIS],
  "what-is-a-dime-cart": [CA_CANNABIS, MA_CANNABIS, LEAFLY_STRAIN_HUB],
  "dime-cart-vs-disposable": [CA_CANNABIS, FDA_VAPING, MA_CANNABIS],
  "dime-live-reserve-explained": [WIKI_LIVE_RESIN, CA_CANNABIS, LEAFLY_STRAIN_HUB],
  "signature-vs-live-reserve": [WIKI_LIVE_RESIN, CA_CANNABIS, LEAFLY_STRAIN_HUB],
  "how-to-spot-fake-dime-carts": [CA_CANNABIS, MA_CANNABIS, SAMHSA],
  "how-to-use-a-dime-cart": [CA_CANNABIS, FDA_VAPING, MA_CANNABIS],
  "built-to-beat-leaks-the-dime-hardware-story": [FDA_VAPING, CA_CANNABIS, MA_CANNABIS],
  "how-we-publish-coas": [CA_CANNABIS, MA_CANNABIS, SAMHSA],
  "shopping-by-potency": [CA_CANNABIS, MA_CANNABIS, LEAFLY_STRAIN_HUB],
  "how-dime-state-exclusives-capture-a-place": [CA_CANNABIS, MA_CANNABIS, LEAFLY_STRAIN_HUB],
  "dime-prerolls-are-coming-meet-dimepack-double-ds": [CA_CANNABIS, MA_CANNABIS, LEAFLY_STRAIN_HUB],
  "/shop/vapes": [CA_CANNABIS, MA_CANNABIS, LEAFLY_STRAIN_HUB],
  "/shop/vapes/rosin": [WIKI_ROSIN, CA_CANNABIS, MA_CANNABIS],
  "/shop/vapes/live-reserve": [WIKI_LIVE_RESIN, CA_CANNABIS, LEAFLY_STRAIN_HUB],
  "/shop/vapes/signature": [CA_CANNABIS, MA_CANNABIS, LEAFLY_STRAIN_HUB],
  "/shop/vapes/disposables": [CA_CANNABIS, FDA_VAPING, MA_CANNABIS],
  "/shop": [CA_CANNABIS, MA_CANNABIS, LEAFLY_STRAIN_HUB],
  "/locations": [CA_CANNABIS, MA_CANNABIS, SAMHSA],
  product: [LEAFLY_STRAIN_HUB, CA_CANNABIS, MA_CANNABIS],
};

export function outboundCitationsFor(key: string): readonly OutboundCitation[] {
  if (OUTBOUND_BY_KEY[key]) return OUTBOUND_BY_KEY[key]!;
  if (key.startsWith("product:")) return OUTBOUND_BY_KEY.product ?? [];
  if (key.startsWith("/shop")) return OUTBOUND_BY_KEY["/shop"] ?? [];
  // Blog posts without a bespoke map still get educational outbound links
  return [CA_CANNABIS, MA_CANNABIS, LEAFLY_STRAIN_HUB];
}
