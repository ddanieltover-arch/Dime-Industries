// lib/social-proof/purchase-notifications.ts
// Pure helpers for storefront purchase social-proof toasts.

export type SocialProofProduct = {
  slug: string;
  name: string;
  imageUrl: string | null;
};

export type PurchaseNotification = {
  id: string;
  firstName: string;
  lastName: string;
  state: string;
  product: SocialProofProduct;
};

/** Session-scoped dismiss — cleared when the browser tab/session ends ("next visit"). */
export const PURCHASE_TOAST_DISMISS_KEY = "dime.purchaseToast.dismissed";

export const PURCHASE_TOAST_INTERVAL_MS = 10_000;
export const PURCHASE_TOAST_VISIBLE_MS = 7_000;

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Jamie",
  "Cameron",
  "Drew",
  "Blake",
  "Reese",
  "Skyler",
  "Parker",
  "Hayden",
  "Logan",
  "Harper",
  "Mason",
  "Emma",
  "Noah",
  "Olivia",
  "Liam",
  "Sophia",
  "Mia",
  "Ethan",
  "Chloe",
  "Lucas",
  "Zoe",
  "Nathan",
] as const;

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Walker",
] as const;

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** Trim SEO suffixes / long catalog titles for toast copy. */
export function shortenProductName(name: string, maxLen = 42): string {
  let next = name
    .replace(/\s*[–—|-]\s*Dime Industries\s*/gi, "")
    .replace(/:\s*Potent Flavor & Effects/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (next.length <= maxLen) return next;
  const cut = next.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function productHref(slug: string): string {
  return `/product/${slug}`;
}

export function createPurchaseNotification(
  products: readonly SocialProofProduct[],
  avoidSlug?: string | null,
): PurchaseNotification | null {
  if (products.length === 0) return null;

  const pool =
    avoidSlug && products.length > 1
      ? products.filter((p) => p.slug !== avoidSlug)
      : products;
  const product = pickOne(pool);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    firstName: pickOne(FIRST_NAMES),
    lastName: pickOne(LAST_NAMES),
    state: pickOne(US_STATES),
    product: {
      slug: product.slug,
      name: shortenProductName(product.name),
      imageUrl: product.imageUrl,
    },
  };
}

export function isPurchaseToastDismissed(
  storage: Pick<Storage, "getItem"> | null | undefined,
): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(PURCHASE_TOAST_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissPurchaseToast(
  storage: Pick<Storage, "setItem"> | null | undefined,
): void {
  if (!storage) return;
  try {
    storage.setItem(PURCHASE_TOAST_DISMISS_KEY, "1");
  } catch {
    // private mode / quota — treat as best-effort
  }
}
