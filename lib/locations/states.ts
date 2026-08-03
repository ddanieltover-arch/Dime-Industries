// lib/locations/states.ts
export type LocationRetailer = {
  name: string;
  city: string;
  note?: string;
};

export type LocationCity = {
  name: string;
  /** Optional local modifier note for SEO / shopper guidance */
  note?: string;
};

export type LocationFaq = {
  question: string;
  answer: string;
};

export type LocationState = {
  slug: string;
  name: string;
  code: string;
  purchasableOnline: boolean;
  /** Meta description */
  blurb: string;
  /** Page H1 — includes primary local keyword */
  h1: string;
  /** 40–60 word answer capsule for “find DIME in {state}” */
  answer: string;
  /** Supporting paragraphs after the capsule */
  body: string[];
  cities: LocationCity[];
  /** Product lines to ask for at retail */
  askFor: string[];
  faqs: LocationFaq[];
  retailers: LocationRetailer[];
};

function baseFaqs(state: {
  name: string;
  code: string;
  purchasableOnline: boolean;
}): LocationFaq[] {
  const online = state.purchasableOnline
    ? `Yes — licensed online checkout ships DIME in ${state.name} where delivery is available. You can also buy at authorized retailers.`
    : `Not yet. In ${state.name}, buy DIME at authorized licensed retailers. Online checkout for ${state.code} is not available on this site right now.`;

  return [
    {
      question: `Where can I find DIME Industries in ${state.name}?`,
      answer: `Ask licensed cannabis retailers in ${state.name} for DIME carts, vapes, edibles, and hardware. Availability varies by shop and jurisdiction — always buy from licensed sellers.`,
    },
    {
      question: `Can I buy DIME online in ${state.code}?`,
      answer: online,
    },
    {
      question: `What DIME products should I ask for?`,
      answer: `Common asks: Signature and Live Reserve carts, Rosin where stocked, edibles, and DIME batteries/accessories. Confirm the batch on Lab Results and validate authenticity after purchase.`,
    },
  ];
}

export const LOCATION_STATES: LocationState[] = [
  {
    slug: "california",
    name: "California",
    code: "CA",
    purchasableOnline: true,
    blurb:
      "Find DIME Industries in California — shop online for CA delivery or locate licensed retailers for DIME carts, Live Reserve, Rosin, and edibles.",
    h1: "Find DIME in California",
    answer:
      "DIME Industries is available across California through licensed retailers and online delivery where checkout is enabled. Shop DIME carts, Live Reserve, Rosin, and edibles from authorized sellers — then validate authenticity and check lab results for your batch.",
    body: [
      "Whether you are in Los Angeles, Orange County, San Diego, or elsewhere in CA, ask your budtender for DIME Signature, Live Reserve, and related lines. Product menus change by retailer and city.",
      "Online shoppers in eligible California zones can browse the catalog after age verification. Retail-only SKUs still ship through licensed brick-and-mortar partners.",
    ],
    cities: [
      { name: "Los Angeles", note: "Ask licensed LA retailers for DIME carts and edibles." },
      { name: "Orange County", note: "Look for Signature, Live Reserve, and Rosin where stocked." },
      { name: "San Diego", note: "Confirm availability with your local licensed dispensary." },
      { name: "Bay Area", note: "Menus vary — ask for DIME hardware and lab-tested extracts." },
    ],
    askFor: ["Signature carts", "Live Reserve", "Rosin vapes", "Edibles", "Batteries & accessories"],
    faqs: baseFaqs({ name: "California", code: "CA", purchasableOnline: true }),
    retailers: [
      {
        name: "Licensed CA retailers",
        city: "Statewide",
        note: "Ask your budtender for DIME Signature, Live Reserve, Rosin, and more.",
      },
    ],
  },
  {
    slug: "massachusetts",
    name: "Massachusetts",
    code: "MA",
    purchasableOnline: true,
    blurb:
      "Find DIME Industries in Massachusetts — shop online for MA delivery or visit authorized retailers for DIME carts, vapes, and edibles.",
    h1: "Find DIME in Massachusetts",
    answer:
      "DIME Industries sells through licensed Massachusetts retailers and online delivery where checkout is enabled. Look for DIME carts, hardware, and edibles at authorized shops, then validate your product and review COA data when available.",
    body: [
      "From Greater Boston to other MA markets, availability depends on each licensed retailer’s menu. Ask for DIME by name — Signature, Live Reserve, and edibles are common requests.",
      "If you qualify for online shopping in Massachusetts, age-verify and browse the catalog. Otherwise use Find DIME to plan a licensed retail stop.",
    ],
    cities: [
      { name: "Boston", note: "Ask Greater Boston licensed retailers for DIME carts and edibles." },
      { name: "Cambridge", note: "Menus vary — confirm DIME stock with your dispensary." },
      { name: "Worcester", note: "Look for DIME hardware and lab-tested extracts." },
    ],
    askFor: ["Signature carts", "Live Reserve", "Edibles", "Batteries & accessories"],
    faqs: baseFaqs({ name: "Massachusetts", code: "MA", purchasableOnline: true }),
    retailers: [
      {
        name: "Licensed MA retailers",
        city: "Statewide",
        note: "Look for DIME hardware and edibles on the shelf.",
      },
    ],
  },
  {
    slug: "arizona",
    name: "Arizona",
    code: "AZ",
    purchasableOnline: false,
    blurb:
      "Find DIME Industries in Arizona at authorized licensed retailers — including State Exclusive flavors where stocked. Online checkout is not available in AZ yet.",
    h1: "Find DIME in Arizona",
    answer:
      "In Arizona, buy DIME from authorized licensed retailers only. Online checkout is not available for AZ on this site yet. Ask for DIME carts, State Exclusive flavors where stocked, and lab-tested edibles — then validate authenticity after purchase.",
    body: [
      "Phoenix-area and statewide menus change often. Bring the brand name “DIME Industries” and ask about Signature, Live Reserve, and Arizona State Exclusive profiles when available.",
    ],
    cities: [
      { name: "Phoenix", note: "Ask licensed Phoenix retailers for DIME carts and State Exclusives." },
      { name: "Scottsdale", note: "Confirm Live Reserve and Signature availability in-store." },
      { name: "Tucson", note: "Menus vary — ask your budtender for DIME by name." },
    ],
    askFor: ["Signature carts", "Live Reserve", "State Exclusive flavors", "Edibles"],
    faqs: baseFaqs({ name: "Arizona", code: "AZ", purchasableOnline: false }),
    retailers: [{ name: "Authorized AZ retailers", city: "Statewide" }],
  },
  {
    slug: "montana",
    name: "Montana",
    code: "MT",
    purchasableOnline: false,
    blurb:
      "Find DIME Industries in Montana at licensed retailers. Online checkout is not available in MT on this site yet.",
    h1: "Find DIME in Montana",
    answer:
      "DIME is available through licensed Montana retailers. Online checkout for MT is not available here yet — visit an authorized shop, ask for DIME carts and edibles, and validate authenticity when prompted.",
    body: [
      "Montana retail menus differ by city. Ask for DIME Industries by name and confirm which lines your licensed retailer currently stocks.",
    ],
    cities: [
      { name: "Billings", note: "Ask licensed retailers for current DIME inventory." },
      { name: "Missoula", note: "Menus vary — confirm carts and edibles in-store." },
      { name: "Bozeman", note: "Ask your budtender for DIME hardware and extracts." },
    ],
    askFor: ["Signature carts", "Live Reserve", "Edibles"],
    faqs: baseFaqs({ name: "Montana", code: "MT", purchasableOnline: false }),
    retailers: [{ name: "Authorized MT retailers", city: "Statewide" }],
  },
  {
    slug: "nevada",
    name: "Nevada",
    code: "NV",
    purchasableOnline: false,
    blurb:
      "Find DIME Industries in Nevada at authorized licensed retailers — Las Vegas and statewide. Online checkout is not available in NV yet.",
    h1: "Find DIME in Nevada",
    answer:
      "Buy DIME in Nevada at authorized licensed retailers. Online checkout is not available for NV on this site yet. Ask for DIME carts, Live Reserve, and edibles where stocked, then validate your pack after purchase.",
    body: [
      "Las Vegas and other NV markets rotate SKUs frequently. Ask for DIME Industries explicitly so budtenders can check live inventory.",
    ],
    cities: [
      { name: "Las Vegas", note: "Ask licensed LV retailers for DIME carts and edibles." },
      { name: "Henderson", note: "Confirm Signature and Live Reserve availability." },
      { name: "Reno", note: "Menus vary — ask for DIME by brand name." },
    ],
    askFor: ["Signature carts", "Live Reserve", "Edibles", "Batteries & accessories"],
    faqs: baseFaqs({ name: "Nevada", code: "NV", purchasableOnline: false }),
    retailers: [{ name: "Authorized NV retailers", city: "Statewide" }],
  },
  {
    slug: "new-jersey",
    name: "New Jersey",
    code: "NJ",
    purchasableOnline: false,
    blurb:
      "Find DIME Industries in New Jersey at authorized licensed retailers. Online checkout is not available in NJ on this site yet.",
    h1: "Find DIME in New Jersey",
    answer:
      "In New Jersey, purchase DIME only from authorized licensed cannabis retailers. Online checkout for NJ is not available here yet. Ask for DIME carts and edibles, then validate authenticity after you buy.",
    body: [
      "NJ retail availability is shop-specific. Bring “DIME Industries” and ask which Signature, Live Reserve, or edible SKUs are on the shelf today.",
    ],
    cities: [
      { name: "Newark", note: "Ask licensed retailers for current DIME stock." },
      { name: "Jersey City", note: "Confirm carts and edibles with your dispensary." },
      { name: "Atlantic City", note: "Menus vary — ask for DIME by name." },
    ],
    askFor: ["Signature carts", "Live Reserve", "Edibles"],
    faqs: baseFaqs({ name: "New Jersey", code: "NJ", purchasableOnline: false }),
    retailers: [{ name: "Authorized NJ retailers", city: "Statewide" }],
  },
  {
    slug: "new-mexico",
    name: "New Mexico",
    code: "NM",
    purchasableOnline: false,
    blurb:
      "Find DIME Industries in New Mexico at authorized retailers — including State Exclusive flavors where stocked.",
    h1: "Find DIME in New Mexico",
    answer:
      "DIME is available at authorized New Mexico retailers, including State Exclusive flavors where stocked. Online checkout for NM is not available on this site yet — buy licensed, then validate authenticity.",
    body: [
      "Ask specifically for DIME State Exclusive profiles when you want region-inspired flavors, plus core Signature and Live Reserve carts where available.",
    ],
    cities: [
      { name: "Albuquerque", note: "Ask for DIME carts and State Exclusive flavors." },
      { name: "Santa Fe", note: "Confirm Live Reserve and Signature inventory." },
      { name: "Las Cruces", note: "Menus vary — ask your budtender for DIME." },
    ],
    askFor: ["State Exclusive flavors", "Signature carts", "Live Reserve", "Edibles"],
    faqs: baseFaqs({ name: "New Mexico", code: "NM", purchasableOnline: false }),
    retailers: [
      {
        name: "Authorized NM retailers",
        city: "Statewide",
        note: "Ask about State Exclusive flavors alongside core DIME lines.",
      },
    ],
  },
  {
    slug: "new-york",
    name: "New York",
    code: "NY",
    purchasableOnline: false,
    blurb:
      "Find DIME Industries in New York at authorized licensed retailers. Online checkout is not available in NY on this site yet.",
    h1: "Find DIME in New York",
    answer:
      "Purchase DIME in New York from authorized licensed retailers only. Online checkout for NY is not available here yet. Ask for DIME carts and edibles, then validate authenticity after purchase.",
    body: [
      "NYC and upstate menus differ. Ask for DIME Industries by name and confirm which lab-tested lines your licensed retailer carries.",
    ],
    cities: [
      { name: "New York City", note: "Ask licensed NYC retailers for DIME carts and edibles." },
      { name: "Buffalo", note: "Confirm Signature and Live Reserve availability." },
      { name: "Albany", note: "Menus vary — ask for DIME by brand name." },
    ],
    askFor: ["Signature carts", "Live Reserve", "Edibles"],
    faqs: baseFaqs({ name: "New York", code: "NY", purchasableOnline: false }),
    retailers: [{ name: "Authorized NY retailers", city: "Statewide" }],
  },
  {
    slug: "oklahoma",
    name: "Oklahoma",
    code: "OK",
    purchasableOnline: false,
    blurb:
      "Find DIME Industries in Oklahoma at authorized licensed retailers. Online checkout is not available in OK on this site yet.",
    h1: "Find DIME in Oklahoma",
    answer:
      "In Oklahoma, buy DIME at authorized licensed retailers. Online checkout for OK is not available on this site yet. Ask for DIME carts and edibles, then validate authenticity when prompted.",
    body: [
      "Oklahoma retail inventory rotates. Ask for DIME Industries explicitly and check which Signature, Live Reserve, or edible SKUs are in stock.",
    ],
    cities: [
      { name: "Oklahoma City", note: "Ask licensed OKC retailers for DIME carts." },
      { name: "Tulsa", note: "Confirm Live Reserve and Signature availability." },
      { name: "Norman", note: "Menus vary — ask your budtender for DIME." },
    ],
    askFor: ["Signature carts", "Live Reserve", "Edibles"],
    faqs: baseFaqs({ name: "Oklahoma", code: "OK", purchasableOnline: false }),
    retailers: [{ name: "Authorized OK retailers", city: "Statewide" }],
  },
];

export function getLocationState(slug: string) {
  return LOCATION_STATES.find((s) => s.slug === slug) ?? null;
}

export function locationCityNames(state: LocationState): string[] {
  return state.cities.map((c) => c.name);
}
