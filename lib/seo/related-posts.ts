// lib/seo/related-posts.ts — pillar–cluster related posts + sidebar CTAs

export type BlogSidebarLink = {
  href: string;
  label: string;
  body: string;
};

/** Topical clusters for internal linking (slug → preferred sibling slugs). */
export const BLOG_CLUSTER_MAP: Record<string, readonly string[]> = {
  "what-is-a-dime-cart": [
    "dime-cart-vs-disposable",
    "how-to-use-a-dime-cart",
    "how-to-spot-fake-dime-carts",
    "dime-live-reserve-explained",
    "signature-vs-live-reserve",
    "built-to-beat-leaks-the-dime-hardware-story",
  ],
  "dime-cart-vs-disposable": [
    "dime-disposable-vapes",
    "what-is-a-dime-cart",
    "how-to-use-a-dime-cart",
    "built-to-beat-leaks-the-dime-hardware-story",
    "how-to-spot-fake-dime-carts",
  ],
  "dime-live-reserve-explained": [
    "signature-vs-live-reserve",
    "what-is-a-dime-cart",
    "dime-cart-vs-disposable",
  ],
  "signature-vs-live-reserve": [
    "dime-live-reserve-explained",
    "what-is-a-dime-cart",
    "shopping-by-potency",
  ],
  "how-to-spot-fake-dime-carts": [
    "what-is-a-dime-cart",
    "how-we-publish-coas",
    "built-to-beat-leaks-the-dime-hardware-story",
  ],
  "how-to-use-a-dime-cart": [
    "dime-vape-heat-settings",
    "what-is-a-dime-cart",
    "dime-cart-vs-disposable",
    "built-to-beat-leaks-the-dime-hardware-story",
  ],
  "built-to-beat-leaks-the-dime-hardware-story": [
    "what-is-a-dime-cart",
    "dime-cart-vs-disposable",
    "how-to-spot-fake-dime-carts",
  ],
  "dime-prerolls-are-coming-meet-dimepack-double-ds": [
    "shopping-by-potency",
    "how-we-publish-coas",
    "what-is-a-dime-cart",
  ],
  "how-dime-state-exclusives-capture-a-place": [
    "what-is-a-dime-cart",
    "dime-live-reserve-explained",
    "shopping-by-potency",
  ],
  "how-we-publish-coas": [
    "how-to-spot-fake-dime-carts",
    "shopping-by-potency",
    "what-is-a-dime-cart",
  ],
  "shopping-by-potency": [
    "how-we-publish-coas",
    "signature-vs-live-reserve",
    "what-is-a-dime-cart",
  ],
  "how-many-dimes-in-a-roll": [
    "what-is-a-dime-cart",
    "how-to-spot-fake-dime-carts",
    "dime-live-reserve-explained",
  ],
  "best-dime-industries-flavors": [
    "signature-vs-balanced",
    "signature-vs-live-reserve",
    "dime-signature-explained",
    "dime-live-reserve-explained",
    "what-is-dime-rosin",
  ],
  "live-resin-vs-live-rosin": [
    "dime-live-reserve-explained",
    "what-is-dime-rosin",
    "signature-vs-live-reserve",
    "solventless-cart-guide",
  ],
  "how-to-charge-a-dime-battery": [
    "dime-vape-heat-settings",
    "how-to-use-a-dime-cart",
    "what-battery-for-dime-cart",
    "dime-hardware-accessories-guide",
    "built-to-beat-leaks-the-dime-hardware-story",
  ],
  "what-is-in-a-dime-cartridge": [
    "what-is-a-dime-cart",
    "dime-live-reserve-explained",
    "melted-diamonds-vape-explained",
    "how-to-read-a-dime-coa",
  ],
  "are-dime-carts-worth-it": [
    "what-is-a-dime-cart",
    "how-to-spot-fake-dime-carts",
    "dime-warranty-and-validate",
    "beginners-guide-to-dime-carts",
  ],
  "why-is-my-dime-cart-clogged": [
    "how-to-use-a-dime-cart",
    "how-to-store-a-dime-cart",
    "how-to-charge-a-dime-battery",
    "how-to-spot-fake-dime-carts",
  ],
  "how-to-store-a-dime-cart": [
    "how-to-use-a-dime-cart",
    "why-is-my-dime-cart-clogged",
    "how-to-charge-a-dime-battery",
  ],
  "what-is-dime-rosin": [
    "solventless-cart-guide",
    "live-resin-vs-live-rosin",
    "dime-live-reserve-explained",
  ],
  "solventless-cart-guide": [
    "what-is-dime-rosin",
    "live-resin-vs-live-rosin",
    "beginners-guide-to-dime-carts",
  ],
  "dime-signature-explained": [
    "signature-vs-balanced",
    "signature-vs-live-reserve",
    "best-dime-industries-flavors",
    "what-is-a-dime-cart",
  ],
  "melted-diamonds-vape-explained": [
    "dime-live-reserve-explained",
    "signature-vs-live-reserve",
    "what-is-in-a-dime-cartridge",
  ],
  "dime-edibles-buying-guide": [
    "dime-gummies",
    "shopping-by-potency",
    "how-we-publish-coas",
    "best-dime-industries-flavors",
  ],
  "dime-prerolls-buying-guide": [
    "dime-prerolls-are-coming-meet-dimepack-double-ds",
    "shopping-by-potency",
    "how-we-publish-coas",
  ],
  "how-to-read-a-dime-coa": [
    "how-we-publish-coas",
    "lab-tested-dime-carts",
    "shopping-by-potency",
  ],
  "dime-warranty-and-validate": [
    "how-to-spot-fake-dime-carts",
    "how-we-publish-coas",
    "dime-rewards-explained",
  ],
  "beginners-guide-to-dime-carts": [
    "what-is-a-dime-cart",
    "dime-cart-vs-disposable",
    "how-to-use-a-dime-cart",
    "how-to-spot-fake-dime-carts",
    "signature-vs-live-reserve",
    "are-dime-carts-worth-it",
  ],
  "what-battery-for-dime-cart": [
    "dime-vape-heat-settings",
    "how-to-charge-a-dime-battery",
    "dime-hardware-accessories-guide",
    "how-to-use-a-dime-cart",
  ],
  "dime-balanced-explained": [
    "signature-vs-balanced",
    "dime-signature-explained",
    "dime-gummies",
    "beginners-guide-to-dime-carts",
  ],
  "dime-state-exclusive-guide": [
    "how-dime-state-exclusives-capture-a-place",
    "find-dime-phoenix-arizona",
    "best-dime-industries-flavors",
  ],
  "buy-dime-carts-online": [
    "where-to-buy-dime-carts",
    "how-to-spot-fake-dime-carts",
    "beginners-guide-to-dime-carts",
  ],
  "dime-rewards-explained": [
    "dime-warranty-and-validate",
    "dime-promotions-safe-shopping",
    "how-to-spot-fake-dime-carts",
  ],
  "dime-hardware-accessories-guide": [
    "what-battery-for-dime-cart",
    "how-to-charge-a-dime-battery",
    "built-to-beat-leaks-the-dime-hardware-story",
  ],
  "lab-tested-dime-carts": [
    "how-to-read-a-dime-coa",
    "how-we-publish-coas",
    "how-to-spot-fake-dime-carts",
  ],
  "where-to-buy-dime-carts": [
    "buy-dime-carts-online",
    "how-to-spot-fake-dime-carts",
    "find-dime-new-york",
    "find-dime-los-angeles-orange-county",
  ],
  "find-dime-los-angeles-orange-county": [
    "where-to-buy-dime-carts",
    "find-dime-new-york",
    "buy-dime-carts-online",
    "dime-state-exclusive-guide",
  ],
  "find-dime-phoenix-arizona": [
    "dime-state-exclusive-guide",
    "how-dime-state-exclusives-capture-a-place",
    "where-to-buy-dime-carts",
  ],
  "dime-promotions-safe-shopping": [
    "how-to-spot-fake-dime-carts",
    "dime-rewards-explained",
    "where-to-buy-dime-carts",
  ],
  "signature-vs-balanced": [
    "dime-signature-explained",
    "dime-balanced-explained",
    "signature-vs-live-reserve",
    "dime-gummies",
  ],
  "dime-vape-heat-settings": [
    "how-to-use-a-dime-cart",
    "how-to-charge-a-dime-battery",
    "what-battery-for-dime-cart",
    "dime-disposable-vapes",
  ],
  "dime-disposable-vapes": [
    "dime-cart-vs-disposable",
    "dime-vape-heat-settings",
    "what-is-a-dime-cart",
    "how-to-spot-fake-dime-carts",
  ],
  "dime-gummies": [
    "dime-edibles-buying-guide",
    "signature-vs-balanced",
    "shopping-by-potency",
    "how-we-publish-coas",
  ],
  "find-dime-new-york": [
    "where-to-buy-dime-carts",
    "buy-dime-carts-online",
    "find-dime-los-angeles-orange-county",
    "how-to-spot-fake-dime-carts",
  ],
};

const DEFAULT_SIDEBAR: readonly BlogSidebarLink[] = [
  {
    href: "/shop/vapes",
    label: "Shop DIME carts",
    body: "Browse Signature, Live Reserve, Rosin, and more lab-tested vapes.",
  },
  {
    href: "/lab-results",
    label: "Lab results",
    body: "Look up COAs by SKU or product name.",
  },
  {
    href: "/validate",
    label: "Validate",
    body: "Confirm authenticity and unlock warranty.",
  },
];

/** Per-post sidebar overrides (first link is the primary commercial CTA). */
const SIDEBAR_BY_SLUG: Record<string, readonly BlogSidebarLink[]> = {
  "dime-cart-vs-disposable": [
    {
      href: "/shop/vapes/disposables",
      label: "DIME disposables guide",
      body: "Educational landing for dime disposable searches — plus shoppable DIME carts.",
    },
    {
      href: "/shop/vapes",
      label: "Shop DIME carts",
      body: "Browse Signature, Live Reserve, Rosin, and more lab-tested vapes.",
    },
    {
      href: "/blog/what-is-a-dime-cart",
      label: "What is a Dime cart?",
      body: "Hardware, formats, and how carts differ from all-in-ones.",
    },
  ],
  "what-is-a-dime-cart": [
    {
      href: "/shop/vapes",
      label: "Shop DIME carts",
      body: "Browse Signature, Live Reserve, Rosin, and more lab-tested vapes.",
    },
    {
      href: "/shop/vapes/disposables",
      label: "Cart vs disposable",
      body: "Compare formats and shop DIME carts for your market.",
    },
    DEFAULT_SIDEBAR[2]!,
  ],
  "dime-live-reserve-explained": [
    {
      href: "/shop/vapes/live-reserve",
      label: "Shop Live Reserve",
      body: "Strain-forward carts and all-in-ones with high-terpene extract.",
    },
    ...DEFAULT_SIDEBAR.slice(1),
  ],
  "signature-vs-live-reserve": [
    {
      href: "/shop/vapes/signature",
      label: "Shop Signature",
      body: "Flagship distillate-forward DIME carts and disposables.",
    },
    {
      href: "/shop/vapes/live-reserve",
      label: "Shop Live Reserve",
      body: "Compare the strain-expressive Live Reserve lineup.",
    },
    DEFAULT_SIDEBAR[2]!,
  ],
  "how-to-spot-fake-dime-carts": [
    {
      href: "/validate",
      label: "Validate your product",
      body: "Confirm authenticity before you trust a pack.",
    },
    {
      href: "/locations",
      label: "Find licensed retailers",
      body: "Buy DIME only where cannabis sales are legal.",
    },
    DEFAULT_SIDEBAR[1]!,
  ],
  "how-to-use-a-dime-cart": [
    {
      href: "/shop/vapes",
      label: "Shop DIME carts",
      body: "Browse tanks, all-in-ones, and batteries for your market.",
    },
    {
      href: "/validate",
      label: "Validate",
      body: "Confirm authenticity before you trust a pack.",
    },
    {
      href: "/glossary#dime-cart",
      label: "Glossary: Dime cart",
      body: "Short definition for AI and shopper citation.",
    },
  ],
  "dime-prerolls-are-coming-meet-dimepack-double-ds": [
    {
      href: "/shop/prerolls",
      label: "Shop prerolls",
      body: "See preroll availability for your jurisdiction.",
    },
    ...DEFAULT_SIDEBAR.slice(1),
  ],
  "how-dime-state-exclusives-capture-a-place": [
    {
      href: "/shop/vapes",
      label: "Shop State Exclusive vapes",
      body: "Browse regional flavors on DIME hardware.",
    },
    {
      href: "/locations",
      label: "Find DIME near you",
      body: "Locate licensed retailers by state.",
    },
    DEFAULT_SIDEBAR[2]!,
  ],
  "how-many-dimes-in-a-roll": [
    {
      href: "/shop/vapes",
      label: "Shop DIME carts",
      body: "Looking for the cannabis brand? Start with DIME vapes.",
    },
    {
      href: "/locations",
      label: "Find DIME near me",
      body: "Locate licensed retailers that stock DIME.",
    },
    {
      href: "/about",
      label: "About DIME Industries",
      body: "Learn the brand story behind the name.",
    },
  ],
  "signature-vs-balanced": [
    {
      href: "/shop/vapes/signature",
      label: "Shop Signature",
      body: "Everyday distillate-forward DIME carts and all-in-ones.",
    },
    {
      href: "/shop/vapes/balanced",
      label: "Shop Balanced",
      body: "Ratio-minded DIME formats where your market lists them.",
    },
    DEFAULT_SIDEBAR[2]!,
  ],
  "dime-vape-heat-settings": [
    {
      href: "/shop/accessories",
      label: "Shop DIME batteries",
      body: "USB-C batteries with heat presets designed for DIME carts.",
    },
    {
      href: "/blog/how-to-use-a-dime-cart",
      label: "How to use a Dime cart",
      body: "Session steps, mid heat, and storage habits.",
    },
    DEFAULT_SIDEBAR[2]!,
  ],
  "dime-disposable-vapes": [
    {
      href: "/shop/vapes/disposables",
      label: "DIME disposables guide",
      body: "Educational landing for dime disposable searches — plus shoppable DIME carts.",
    },
    {
      href: "/shop/vapes",
      label: "Shop DIME carts",
      body: "Browse Signature, Live Reserve, Rosin, and more lab-tested vapes.",
    },
    DEFAULT_SIDEBAR[2]!,
  ],
  "dime-gummies": [
    {
      href: "/shop/edibles",
      label: "Shop DIME edibles",
      body: "Gummies and softgels — check potency labels and COAs.",
    },
    {
      href: "/shop/edibles/rosin",
      label: "Rosin gummies",
      body: "Solventless-style edible lane where listed.",
    },
    DEFAULT_SIDEBAR[2]!,
  ],
  "find-dime-new-york": [
    {
      href: "/locations/new-york",
      label: "New York locations",
      body: "Licensed DIME retailers in New York.",
    },
    {
      href: "/locations",
      label: "Find DIME near me",
      body: "Nationwide licensed retailer map.",
    },
    DEFAULT_SIDEBAR[2]!,
  ],
};

export function pickRelatedPosts<T extends { slug: string }>(
  currentSlug: string,
  allPosts: readonly T[],
  limit = 3
): T[] {
  const preferred = BLOG_CLUSTER_MAP[currentSlug] ?? [];
  const bySlug = new Map(allPosts.map((p) => [p.slug, p]));
  const picked: T[] = [];

  for (const slug of preferred) {
    if (picked.length >= limit) break;
    const post = bySlug.get(slug);
    if (post) picked.push(post);
  }

  if (picked.length < limit) {
    for (const post of allPosts) {
      if (picked.length >= limit) break;
      if (post.slug === currentSlug) continue;
      if (picked.some((p) => p.slug === post.slug)) continue;
      picked.push(post);
    }
  }

  return picked;
}

export function blogSidebarLinks(slug: string): readonly BlogSidebarLink[] {
  return SIDEBAR_BY_SLUG[slug] ?? DEFAULT_SIDEBAR;
}

export type CatalogSeoLink = { href: string; label: string };

/** Pillar → cluster links shown under catalog heroes (Semrush keyword anchors). */
export function catalogSeoLinks(basePath: string): CatalogSeoLink[] {
  if (basePath === "/shop/vapes") {
    return [
      { href: "/blog/beginners-guide-to-dime-carts", label: "Beginner’s guide to Dime carts" },
      { href: "/blog/what-is-a-dime-cart", label: "What is a Dime cart?" },
      { href: "/blog/best-dime-industries-flavors", label: "Best DIME flavors" },
      { href: "/blog/dime-cart-vs-disposable", label: "Dime cart vs disposable" },
      { href: "/blog/dime-disposable-vapes", label: "DIME disposable vapes" },
      { href: "/shop/vapes/disposables", label: "DIME disposables / pens guide" },
      { href: "/shop/vapes/signature", label: "Signature carts" },
      { href: "/shop/vapes/live-reserve", label: "Live Reserve" },
      { href: "/shop/vapes/rosin", label: "DIME Industries rosin" },
    ];
  }
  if (basePath === "/shop/vapes/disposables") {
    return [
      { href: "/blog/dime-disposable-vapes", label: "DIME disposable vapes" },
      { href: "/blog/dime-cart-vs-disposable", label: "Cart vs disposable" },
      { href: "/shop/vapes", label: "Shop all DIME carts & pens" },
      { href: "/blog/dime-vape-heat-settings", label: "Heat settings & battery modes" },
      { href: "/blog/what-is-a-dime-cart", label: "What is a Dime cart?" },
      { href: "/shop/vapes/signature", label: "Signature line" },
    ];
  }
  if (basePath === "/shop/vapes/rosin") {
    return [
      { href: "/blog/what-is-dime-rosin", label: "What is DIME Rosin?" },
      { href: "/blog/solventless-cart-guide", label: "Solventless cart guide" },
      { href: "/blog/live-resin-vs-live-rosin", label: "Live resin vs live rosin" },
      { href: "/shop/edibles/rosin", label: "Rosin edibles" },
      { href: "/shop/vapes", label: "All DIME carts" },
      { href: "/glossary#rosin", label: "Glossary: Rosin" },
    ];
  }
  if (basePath === "/shop/edibles/rosin") {
    return [
      { href: "/shop/vapes/rosin", label: "Rosin vapes" },
      { href: "/shop/edibles", label: "All edibles" },
      { href: "/blog/shopping-by-potency", label: "Shop by potency" },
    ];
  }
  if (basePath === "/shop/vapes/live-reserve") {
    return [
      { href: "/blog/dime-live-reserve-explained", label: "What is Live Reserve?" },
      { href: "/blog/signature-vs-live-reserve", label: "Signature vs Live Reserve" },
      { href: "/shop/vapes", label: "All DIME carts" },
      { href: "/product/banana-mac", label: "Banana Mac DIME" },
      { href: "/product/papaya", label: "Papaya DIME" },
      { href: "/product/miami-ice", label: "Miami Ice DIME" },
      { href: "/product/king-louis-xiii", label: "King Louis XIII" },
    ];
  }
  if (basePath === "/shop/vapes/signature") {
    return [
      { href: "/blog/signature-vs-balanced", label: "Signature vs Balanced" },
      { href: "/blog/signature-vs-live-reserve", label: "Signature vs Live Reserve" },
      { href: "/blog/best-dime-industries-flavors", label: "Best DIME flavors" },
      { href: "/shop/vapes", label: "All DIME carts" },
      { href: "/product/lime-sherbanger", label: "Lime Sherbanger DIME" },
      { href: "/product/guavalicious", label: "Guavalicious DIME" },
      { href: "/product/blueberry-lemon-haze", label: "Blueberry Lemon Haze DIME" },
      { href: "/product/paradise-passion", label: "Paradise Passion DIME" },
    ];
  }
  if (basePath === "/shop/edibles") {
    return [
      { href: "/blog/dime-gummies", label: "DIME gummies" },
      { href: "/blog/dime-edibles-buying-guide", label: "Edibles buying guide" },
      { href: "/blog/signature-vs-balanced", label: "Signature vs Balanced" },
      { href: "/shop/edibles/rosin", label: "Rosin edibles" },
      { href: "/product/peach", label: "Peach Balanced Gummies" },
    ];
  }
  if (basePath === "/shop/vapes/balanced") {
    return [
      { href: "/blog/signature-vs-balanced", label: "Signature vs Balanced" },
      { href: "/blog/dime-balanced-explained", label: "Balanced explained" },
      { href: "/blog/dime-gummies", label: "DIME gummies" },
      { href: "/shop/vapes/signature", label: "Signature carts" },
    ];
  }
  if (basePath === "/shop/prerolls") {
    return [
      { href: "/blog/dime-prerolls-buying-guide", label: "Prerolls buying guide" },
      { href: "/blog/dime-prerolls-are-coming-meet-dimepack-double-ds", label: "Meet DIMEPACK" },
      { href: "/shop", label: "Shop all DIME" },
      { href: "/locations", label: "Find DIME retailers" },
      { href: "/lab-results", label: "Lab results" },
    ];
  }
  if (basePath === "/shop") {
    return [
      { href: "/shop/vapes", label: "DIME carts & vape pens" },
      { href: "/shop/prerolls", label: "Prerolls / flower formats" },
      { href: "/shop/vapes/disposables", label: "Disposables guide" },
      { href: "/shop/vapes/rosin", label: "Rosin" },
      { href: "/blog/best-dime-industries-flavors", label: "Best DIME flavors" },
      { href: "/locations", label: "Find DIME dispensaries" },
      { href: "/blog/beginners-guide-to-dime-carts", label: "Beginner’s cart guide" },
    ];
  }
  return [];
}
