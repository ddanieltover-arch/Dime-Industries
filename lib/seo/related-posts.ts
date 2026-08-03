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
      { href: "/blog/what-is-a-dime-cart", label: "What is a Dime cart?" },
      { href: "/blog/dime-cart-vs-disposable", label: "Dime cart vs disposable" },
      { href: "/shop/vapes/disposables", label: "DIME disposables guide" },
      { href: "/shop/vapes/rosin", label: "DIME Industries rosin" },
      { href: "/shop/vapes/live-reserve", label: "Live Reserve" },
      { href: "/shop/vapes/signature", label: "Signature carts" },
    ];
  }
  if (basePath === "/shop/vapes/disposables") {
    return [
      { href: "/blog/dime-cart-vs-disposable", label: "Cart vs disposable" },
      { href: "/shop/vapes", label: "Shop all DIME carts" },
      { href: "/blog/what-is-a-dime-cart", label: "What is a Dime cart?" },
      { href: "/shop/vapes/signature", label: "Signature line" },
    ];
  }
  if (basePath === "/shop/vapes/rosin") {
    return [
      { href: "/blog/what-is-a-dime-cart", label: "What is a Dime cart?" },
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
      { href: "/product/king-louis-xiii", label: "King Louis XIII" },
    ];
  }
  if (basePath === "/shop/vapes/signature") {
    return [
      { href: "/blog/signature-vs-live-reserve", label: "Signature vs Live Reserve" },
      { href: "/blog/what-is-a-dime-cart", label: "What is a Dime cart?" },
      { href: "/shop/vapes", label: "All DIME carts" },
      { href: "/product/key-lime-pie", label: "Key Lime Pie" },
      { href: "/product/blackberry-og", label: "Blackberry OG" },
    ];
  }
  if (basePath === "/shop") {
    return [
      { href: "/shop/vapes", label: "DIME carts & vapes" },
      { href: "/shop/vapes/disposables", label: "Disposables guide" },
      { href: "/shop/vapes/rosin", label: "Rosin" },
      { href: "/locations", label: "Find DIME near me" },
      { href: "/blog", label: "Blog guides" },
    ];
  }
  return [];
}
