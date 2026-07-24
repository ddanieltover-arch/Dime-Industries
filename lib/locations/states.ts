// lib/locations/states.ts
export type LocationState = {
  slug: string;
  name: string;
  code: string;
  purchasableOnline: boolean;
  blurb: string;
  retailers: { name: string; city: string; note?: string }[];
};

export const LOCATION_STATES: LocationState[] = [
  {
    slug: "california",
    name: "California",
    code: "CA",
    purchasableOnline: true,
    blurb: "Shop DIME online for CA delivery, or find a licensed neighborhood retailer.",
    retailers: [
      { name: "Licensed CA retailers", city: "Statewide", note: "Ask your budtender for DIME Signature, Live Reserve, and more." },
    ],
  },
  {
    slug: "massachusetts",
    name: "Massachusetts",
    code: "MA",
    purchasableOnline: true,
    blurb: "Shop DIME online for MA delivery, or visit an authorized retailer.",
    retailers: [
      { name: "Licensed MA retailers", city: "Statewide", note: "Look for DIME hardware and edibles on the shelf." },
    ],
  },
  {
    slug: "arizona",
    name: "Arizona",
    code: "AZ",
    purchasableOnline: false,
    blurb: "Find DIME at authorized Arizona retailers. Online checkout is not available in AZ yet.",
    retailers: [{ name: "Authorized AZ retailers", city: "Statewide" }],
  },
  {
    slug: "montana",
    name: "Montana",
    code: "MT",
    purchasableOnline: false,
    blurb: "DIME is available through licensed Montana retailers.",
    retailers: [{ name: "Authorized MT retailers", city: "Statewide" }],
  },
  {
    slug: "nevada",
    name: "Nevada",
    code: "NV",
    purchasableOnline: false,
    blurb: "Find DIME at authorized Nevada retailers.",
    retailers: [{ name: "Authorized NV retailers", city: "Statewide" }],
  },
  {
    slug: "new-jersey",
    name: "New Jersey",
    code: "NJ",
    purchasableOnline: false,
    blurb: "Find DIME at authorized New Jersey retailers.",
    retailers: [{ name: "Authorized NJ retailers", city: "Statewide" }],
  },
  {
    slug: "new-mexico",
    name: "New Mexico",
    code: "NM",
    purchasableOnline: false,
    blurb: "Find DIME at authorized New Mexico retailers — including State Exclusive flavors.",
    retailers: [{ name: "Authorized NM retailers", city: "Statewide" }],
  },
  {
    slug: "new-york",
    name: "New York",
    code: "NY",
    purchasableOnline: false,
    blurb: "Find DIME at authorized New York retailers.",
    retailers: [{ name: "Authorized NY retailers", city: "Statewide" }],
  },
  {
    slug: "oklahoma",
    name: "Oklahoma",
    code: "OK",
    purchasableOnline: false,
    blurb: "Find DIME at authorized Oklahoma retailers.",
    retailers: [{ name: "Authorized OK retailers", city: "Statewide" }],
  },
];

export function getLocationState(slug: string) {
  return LOCATION_STATES.find((s) => s.slug === slug) ?? null;
}
