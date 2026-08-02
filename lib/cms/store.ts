// lib/cms/store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { DEFAULT_HOMEPAGE_LAYOUT, normalizeHomepageLayout } from "./homepage-layout";
import type { BlogPost, CmsPage, HomepageBanner, HomepageLayout } from "./types";

export const CMS_COOKIE = "dime_cms";

const pageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  status: z.enum(["draft", "published"]),
  updatedAt: z.string(),
});

const postSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  body: z.string(),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string(),
  updatedAt: z.string(),
});

const bannerSchema = z.object({
  enabled: z.boolean(),
  headline: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
  ctaHref: z.string(),
});

const jarSchema = z.object({
  pages: z.array(pageSchema),
  posts: z.array(postSchema),
  banner: bannerSchema,
  layout: z.unknown().optional(),
  seeded: z.boolean().optional(),
});

const DEFAULT_PAGES: CmsPage[] = [
  {
    slug: "about",
    title: "About Us",
    body: "DIME Industries is a licensed cannabis brand founded in 2016. We make award-winning vapes, gummies, softgels, and prerolls — and we engineer our own hardware instead of buying generic parts.\n\n### Our commitment\nInnovation takes center stage. Our unwavering commitment to excellence has garnered more than 30 prestigious awards and recognition in leading industry publications.\n\n### Where we sell\nShop online for delivery in California and Massachusetts. Find neighborhood retailers nationwide via Find DIME.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    body: "### What is DIME Industries?\nDIME Industries is a licensed cannabis brand founded in 2016. DIME makes vapes, gummies, softgels, and prerolls, and engineers its own hardware. The brand has won more than 100 industry awards.\n\n### Where can I find the closest store?\nUse Find DIME on this site to browse locations by state, or shop online for CA and MA delivery.\n\n### How do I know my DIME product is authentic?\nScratch the validation code on the package, then register it at Validate. Validation confirms authenticity and unlocks limited warranty, loyalty points, and early access.\n\n### What products does DIME make?\nAll-in-one vapes, tanks, 510-thread batteries, gummies, softgels, and prerolls across Signature, Live Reserve, Balanced, Rosin, State Exclusive, and Collaborations lines.\n\n### Does DIME run sales or a rewards program?\nYes. See Promotions for current offers. Rewards members earn points, discounts, and early access when they validate products and shop.\n\n### Will another brand's battery work with a DIME tank?\nMost 510 batteries work, but air-draw batteries without a button and weaker batteries under 3.7v often fail. Use a DIME 5th Gen battery for best results.\n\n### What is the shelf life of edibles?\nSeveral months when stored cool and dry.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "contact",
    title: "Contact",
    body: "### Email\nsales@dimeindustries.us\n\n### Wholesale\nsales@dimeindustries.us · Apply at /wholesale\n\n### Privacy requests\nsales@dimeindustries.us\n\nInclude your order ID from the confirmation email for order issues. For authenticity or warranty, use Validate with your package code.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "careers",
    title: "Careers",
    body: "### Build with DIME\nWe're always looking for people who care about craft hardware, compliance, and brand excellence.\n\n### How to apply\nSend a short intro and resume to sales@dimeindustries.us with the role you're interested in.\n\n### Culture\nLab-tested standards apply to how we work too — clear ownership, quality over shortcuts, and respect for regulated markets.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "promotions",
    title: "Promotions",
    body: "### Current offers\nCheck back often for drops, bundle deals, and member-only promotions.\n\n### Rewards members\nValidate your products and shop while logged in to earn points toward discounts and early access.\n\n### Stay notified\nJoin the members newsletter on the homepage for drop alerts.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "links",
    title: "Quick Links",
    body: "### Shop\nBrowse the full catalog at /shop\n\n### Validate products\n/validate\n\n### Lab results\n/lab-results\n\n### Rewards\n/rewards\n\n### DIME App\n/app\n\n### AI Assistant\n/assistant\n\n### Find DIME\n/locations\n\n### Wholesale\n/wholesale",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/terms",
    title: "Terms of Service",
    body: "By using this platform you confirm you are 21+ (or a qualifying medical patient where applicable) and that cannabis products are legal in your jurisdiction.\n\n### Orders\nOrders are fulfilled only where permitted. Prices exclude tax until checkout. Retail prices are sourced from licensed marketplace menus (Eaze CA; Rolling Releaf MA where noted) and may differ by jurisdiction or format.\n\n### Accounts\nYou are responsible for keeping login credentials secure and for activity under your account.\n\n### Changes\nWe may update these terms; continued use after notice constitutes acceptance.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/privacy",
    title: "Privacy Policy",
    body: "We collect account, order, and device data needed to operate the storefront, process payments, and meet compliance obligations.\n\n### What we don't do\nWe do not sell personal information.\n\n### Requests\nContact sales@dimeindustries.us for access, correction, or deletion requests where applicable.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/medical-privacy",
    title: "Medical Privacy Policy",
    body: "If medical patient flows are enabled, medical information is handled under this medical privacy notice and access controls.\n\nMedical status is optional and unused at the flat 21+ launch gate.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/returns",
    title: "Returns Policy",
    body: "Defective hardware may be eligible for exchange when validated through our product registration flow and purchased from a licensed source.\n\nContact support with photos, retailer details, and your order ID.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/wholesale-rewards",
    title: "Wholesale Rewards Terms",
    body: "Wholesale rewards, if offered, are available only to approved wholesale accounts in good standing.\n\nPoints, rebates, or incentives may be adjusted or revoked for policy violations, chargebacks, or inactive accounts. Contact sales@dimeindustries.us for program details.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "wholesale",
    title: "Wholesale",
    body: "Apply at /wholesale for DIME B2B pricing. Approved accounts get wholesale tiers with NET-30, NET-60, or Bitcoin upfront.\n\nQuestions: sales@dimeindustries.us",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

const DEFAULT_POSTS: BlogPost[] = [
  {
    slug: "built-to-beat-leaks-the-dime-hardware-story",
    title: "Built to beat leaks: the DIME hardware story",
    excerpt: "Why we engineer our own hardware instead of buying generic parts.",
    body: "Leak resistance and draw quality start in the hardware. DIME designs tanks and devices in-house so extract and experience stay consistent across Signature, Live Reserve, and beyond.\n\n### What that means for you\nFewer failed sessions, better flavor retention, and a warranty path when something goes wrong — validate your product to activate coverage.",
    status: "published",
    publishedAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
  {
    slug: "dime-prerolls-are-coming-meet-dimepack-double-ds",
    title: "DIME prerolls are coming: meet DIMEPACK Double Ds",
    excerpt: "Award-winning flower, rolled for a premium session.",
    body: "DIMEPACK Double Ds bring the brand's quality bar to prerolls. Shop Prerolls in the catalog and find a retailer near you on Find DIME.",
    status: "published",
    publishedAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    slug: "how-dime-state-exclusives-capture-a-place",
    title: "How DIME State Exclusives capture a place with every draw",
    excerpt: "Regional drops built for local taste.",
    body: "State Exclusive flavors are crafted for specific markets. Browse the State Exclusive line online where available, and use Find DIME for neighborhood retailers.",
    status: "published",
    publishedAt: "2026-06-10T00:00:00.000Z",
    updatedAt: "2026-06-10T00:00:00.000Z",
  },
  {
    slug: "how-we-publish-coas",
    title: "How we publish certificates of analysis",
    excerpt: "Every active SKU links to lab results so potency is never a surprise.",
    body: "Transparency is the product. Each batch carries THC/CBD metadata on the card and a COA path on Lab Results.\n\nWhen the live COA host is connected, records swap in without a storefront redesign.",
    status: "published",
    publishedAt: "2026-06-15T00:00:00.000Z",
    updatedAt: "2026-06-15T00:00:00.000Z",
  },
  {
    slug: "how-many-dimes-in-a-roll",
    title: "How many dimes in a roll?",
    excerpt:
      "A standard U.S. dime roll holds 40 dimes ($4 face value). Here’s how coin rolls work — plus how to find DIME Industries products nearby.",
    body: `Quick Answer: A standard United States dime roll contains 40 dimes, equal to $4.00 in face value. Banks, armored carriers, and coin machines package circulating dimes in paper or plastic rolls of 40 so tellers and businesses can count change quickly without sorting loose coins by hand.

### How many dimes are in a standard roll?

In the United States, a full roll of dimes is standardized at 40 coins. That convention is used by banks, credit unions, and retail cash offices nationwide. If you open a roll of dimes from a bank drawer or a wrapped coin order, you should find forty Roosevelt dimes (or older Winged Liberty dimes still in circulation) unless the roll was short-filled or broken open earlier.

The same packaging logic applies to other U.S. denominations, each with its own count: pennies typically roll at 50, nickels at 40, quarters at 40, and half dollars at 20. Knowing the dime count helps when you are verifying a cash drawer, preparing a deposit, or teaching kids how coin rolls work.

### How much is a roll of dimes worth?

Forty dimes at ten cents each equal $4.00 in face value. That number does not change with the metal melt value of circulating clad coins — for everyday banking and retail, face value is what matters. Collectors sometimes pay a premium for uncirculated bank-wrapped rolls or for older silver dimes dated 1964 and earlier, but a modern circulating roll is still worth four dollars in spendable change.

If you are depositing coins, most banks credit the face value after counting. Some branches charge a fee for non-customers or require coins to be rolled before acceptance. Machine counters at grocery stores or coin kiosks may take a percentage fee, so a $4 roll might return slightly less in cash or store credit after fees.

### What does a dime roll look like?

Traditional paper coin wraps are printed with the denomination, the piece count, and often the dollar total. A dime wrap typically shows “40 dimes” and “$4.00.” Plastic machine wraps from coin sorters are clear or tinted tubes with similar labeling. Either way, the sealed roll should feel dense and even; a soft or rattling roll can mean missing coins or an incomplete fill.

Dimes are the thinnest commonly rolled U.S. coin, so a complete roll is shorter than a roll of quarters even though both often hold 40 pieces. That size difference is one reason tellers keep denomination-specific trays and color-coded wrappers.

### Bank rolls vs. machine-wrapped rolls

Bank (or “hand”) wraps are paper sleeves filled by tellers or customers and crimped at the ends. Machine-wrapped rolls come from high-speed sorters used by banks and armored services. Both should contain 40 dimes when filled to standard. Machine wraps are usually more uniform; customer-filled wraps occasionally come up short, which is why many cashiers crack a roll and spot-count before putting it in a till.

Neither wrap type guarantees collectible condition. Circulating rolls mix dates and mint marks. If you care about numismatics, look for special Mint or proof products sold as collectibles — those are not the same as everyday change rolls.

### Why people ask about dime rolls

Searchers ask “how many dimes in a roll” when balancing registers, teaching money math, preparing bank deposits, or settling a friendly debate. The answer is short and stable: forty coins, four dollars. Keeping that fact handy avoids recounting every time a roll hits the counter.

The question also shows up alongside brand curiosity. People who know DIME Industries — the cannabis brand behind award-winning vapes and edibles — sometimes land on the coin query first, then look for the company. Both meanings of “dime” can coexist as long as the coin fact stays clear and product information stays compliant and separate.

### From coin rolls to DIME Industries

DIME Industries is a licensed cannabis brand (est. 2016) known for engineered hardware and lab-tested extracts. If you came here for the coin answer, you already have it: 40 dimes per roll. If you are looking for DIME products, start with [DIME carts and vapes](/shop/vapes), browse [rosin](/shop/vapes/rosin) when you want solventless-style lineups, or [find a licensed retailer near you](/locations). Learn more about the brand on [About DIME Industries](/about).

Always buy cannabis products from licensed retailers in legal markets, validate authenticity when prompted, and keep products away from children and pets.

This article is for educational purposes only. It is not medical, financial, or legal advice. DIME cannabis products are intended for adults 21 and older, or qualifying medical patients, in licensed markets. Keep all cannabis products out of reach of children.

### Frequently asked questions

### How many dimes are in a roll of dimes?

Forty. A standard U.S. dime roll contains 40 coins.

### How much money is in a roll of dimes?

$4.00 in face value (40 × $0.10).

### Are dime rolls the same at every bank?

Yes for face-value packaging: banks use the 40-coin standard. Fees, buyback rules, and whether they accept loose coins vary by institution.

### Do Canadian or other countries use the same dime-roll count?

No. This article covers United States circulating coin rolls. Other countries set their own roll sizes.

### Is this article about DIME cannabis products?

The primary answer is about U.S. coin rolls. DIME Industries product links are optional next steps for readers looking for the brand — for adults 21+ (or qualifying patients) in legal markets only.`,
    status: "published",
    publishedAt: "2026-08-02T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
];

const DEFAULT_BANNER: HomepageBanner = {
  enabled: true,
  headline: "Elevate your experience",
  body: "Explore award-winning DIME vapes, edibles, and prerolls — lab-tested and ready to shop.",
  ctaLabel: "Shop now",
  ctaHref: "/shop",
};

type CmsJar = {
  pages: CmsPage[];
  posts: BlogPost[];
  banner: HomepageBanner;
  layout: HomepageLayout;
};

function emptyJar(): CmsJar {
  return {
    pages: DEFAULT_PAGES,
    posts: DEFAULT_POSTS,
    banner: DEFAULT_BANNER,
    layout: DEFAULT_HOMEPAGE_LAYOUT,
  };
}

async function readJar(): Promise<CmsJar> {
  const store = await cookies();
  const raw = store.get(CMS_COOKIE)?.value;
  if (!raw) {
    return emptyJar();
  }
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success) {
      return emptyJar();
    }
    return {
      pages: parsed.data.pages.length ? parsed.data.pages : DEFAULT_PAGES,
      posts: parsed.data.posts.length ? parsed.data.posts : DEFAULT_POSTS,
      banner: parsed.data.banner,
      layout: normalizeHomepageLayout(parsed.data.layout ?? DEFAULT_HOMEPAGE_LAYOUT),
    };
  } catch {
    return emptyJar();
  }
}

async function writeJar(jar: CmsJar): Promise<void> {
  const store = await cookies();
  store.set(CMS_COOKIE, encodeURIComponent(JSON.stringify({ ...jar, seeded: true })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** Deduplicate seed across parallel static/ISR renders (one seed per process). */
let dbCmsReady: Promise<boolean> | null = null;

async function useDbCms(): Promise<boolean> {
  // Static generation must not wait on Postgres — parallel CMS pages were
  // exhausting the pool and hitting Next's 60s page timeout on Vercel.
  if (isProductionBuild()) return false;

  const { isGrowthDatabaseMode } = await import("@/lib/db/growth-mode");
  if (!isGrowthDatabaseMode()) return false;

  if (!dbCmsReady) {
    dbCmsReady = (async () => {
      const { dbSeedCmsIfEmpty } = await import("./cms-db");
      await dbSeedCmsIfEmpty(DEFAULT_PAGES, DEFAULT_POSTS, DEFAULT_BANNER, DEFAULT_HOMEPAGE_LAYOUT);
      return true;
    })().catch((err) => {
      console.error("[cms] database unavailable, falling back to defaults", err);
      dbCmsReady = null;
      return false;
    });
  }
  return dbCmsReady;
}

function publishedOnly<T extends { status: string }>(items: T[], includeDrafts: boolean): T[] {
  return includeDrafts ? items : items.filter((p) => p.status === "published");
}

export async function listCmsPages(includeDrafts = false): Promise<CmsPage[]> {
  if (isProductionBuild()) {
    return publishedOnly(DEFAULT_PAGES, includeDrafts);
  }
  if (await useDbCms()) {
    try {
      const { dbListCmsPages } = await import("./cms-db");
      return publishedOnly(await dbListCmsPages(), includeDrafts);
    } catch (err) {
      console.error("[cms] list pages failed, using defaults", err);
      return publishedOnly(DEFAULT_PAGES, includeDrafts);
    }
  }
  const { pages } = await readJar();
  return publishedOnly(pages, includeDrafts);
}

export async function getCmsPage(slug: string, includeDrafts = false): Promise<CmsPage | null> {
  const pages = await listCmsPages(includeDrafts);
  return pages.find((p) => p.slug === slug) ?? null;
}

export async function upsertCmsPage(page: CmsPage): Promise<void> {
  if (await useDbCms()) {
    const { dbUpsertCmsPage } = await import("./cms-db");
    await dbUpsertCmsPage(page);
    return;
  }
  const jar = await readJar();
  const idx = jar.pages.findIndex((p) => p.slug === page.slug);
  if (idx >= 0) jar.pages[idx] = page;
  else jar.pages.push(page);
  await writeJar(jar);
}

export async function listBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  const sortPosts = (posts: BlogPost[]) =>
    publishedOnly(posts, includeDrafts).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  if (isProductionBuild()) {
    return sortPosts(DEFAULT_POSTS);
  }
  if (await useDbCms()) {
    try {
      const { dbListBlogPosts } = await import("./cms-db");
      return sortPosts(await dbListBlogPosts());
    } catch (err) {
      console.error("[cms] list posts failed, using defaults", err);
      return sortPosts(DEFAULT_POSTS);
    }
  }
  const { posts } = await readJar();
  return sortPosts(posts);
}

export async function getBlogPost(slug: string, includeDrafts = false): Promise<BlogPost | null> {
  const posts = await listBlogPosts(includeDrafts);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function upsertBlogPost(post: BlogPost): Promise<void> {
  if (await useDbCms()) {
    const { dbUpsertBlogPost } = await import("./cms-db");
    await dbUpsertBlogPost(post);
    return;
  }
  const jar = await readJar();
  const idx = jar.posts.findIndex((p) => p.slug === post.slug);
  if (idx >= 0) jar.posts[idx] = post;
  else jar.posts.push(post);
  await writeJar(jar);
}

export async function getHomepageBanner(): Promise<HomepageBanner> {
  if (isProductionBuild()) {
    return DEFAULT_BANNER;
  }
  if (await useDbCms()) {
    try {
      const { dbGetBanner } = await import("./cms-db");
      return (await dbGetBanner()) ?? DEFAULT_BANNER;
    } catch (err) {
      console.error("[cms] banner failed, using defaults", err);
      return DEFAULT_BANNER;
    }
  }
  return (await readJar()).banner;
}

export async function saveHomepageBanner(banner: HomepageBanner): Promise<void> {
  if (await useDbCms()) {
    const { dbSaveBanner } = await import("./cms-db");
    await dbSaveBanner(banner);
    return;
  }
  const jar = await readJar();
  jar.banner = banner;
  await writeJar(jar);
}

export async function getHomepageLayout(): Promise<HomepageLayout> {
  if (isProductionBuild()) {
    return DEFAULT_HOMEPAGE_LAYOUT;
  }
  if (await useDbCms()) {
    try {
      const { dbGetHomepageLayout } = await import("./cms-db");
      const fromDb = await dbGetHomepageLayout();
      return fromDb ? normalizeHomepageLayout(fromDb) : DEFAULT_HOMEPAGE_LAYOUT;
    } catch (err) {
      console.error("[cms] homepage layout failed, using defaults", err);
      return DEFAULT_HOMEPAGE_LAYOUT;
    }
  }
  return (await readJar()).layout;
}

export async function saveHomepageLayout(layout: HomepageLayout): Promise<void> {
  const normalized = normalizeHomepageLayout(layout);
  if (await useDbCms()) {
    const { dbSaveHomepageLayout } = await import("./cms-db");
    await dbSaveHomepageLayout(normalized);
    return;
  }
  const jar = await readJar();
  jar.layout = normalized;
  await writeJar(jar);
}
