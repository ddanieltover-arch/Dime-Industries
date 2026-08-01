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
    body: "DIME Industries is a licensed cannabis brand founded in 2016. We engineer our own hardware and make award-winning vapes, gummies, softgels, and prerolls — built for a potent, reliable cannabis experience.\n\nShop delivery where available at [/shop](/shop), or find neighborhood retailers at [/locations](/locations).\n\n### 2016 — DIME Industries founded\nAfter recognizing a gap in the vape industry, the founders came together to offer powerful hardware and a potent, reliable experience for cannabis consumers.\n\n### 2018 — Tanks & batteries launched\nDIME officially launched the Signature Line with five flavorful tanks and the industry's longest-lasting battery. The unique hardware stood out among competitors from day one.\n\n### 2019 — DIME disposables\nThe Signature Line expanded with more flavor and more hardware. Alongside standard 1000mg tanks, 600mg disposables quickly became a popular discreet option.\n\n### 2020–2021 — Oklahoma, Arizona & Live Reserve\nDespite pandemic-era challenges, DIME expanded into Oklahoma and Arizona. Later that period, Live Reserve launched — true-to-strain flavors made with liquid live resin.\n\n### 2022–2023 — Concentrates, AIO & New Mexico\nDIME introduced the All-in-One device: zero-waste, evenly heating tanks paired with a powerful long-lasting battery for an upgraded disposable experience. Expansion into New Mexico followed as DIME climbed the ranks across markets.\n\n### Present — Nevada, Massachusetts, gummies & prerolls\nToday DIME continues to grow across the United States, including Nevada and Massachusetts, with product lines such as Balanced Line gummies, softgels, and prerolls — still committed to high-quality products for consumers nationwide.",
    status: "published",
    updatedAt: "2026-08-01T23:00:00.000Z",
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    body: "### What is DIME Industries?\nDIME Industries is a licensed cannabis brand founded in 2016. DIME makes vapes, gummies, softgels, and prerolls, and engineers its own hardware instead of buying generic parts. The brand has won more than 100 industry awards. [Shop the full lineup](/shop).\n\n### Where can I find the closest store?\nUse [Find DIME](/locations) to browse retailers by state, or [shop online](/shop) for delivery where available (including CA and MA).\n\n### How do I know my DIME product is authentic?\nScratch the validation code on the package fully so you can read it, then register it at [Validate](/validate) (or in the DIME App when available). Validation confirms authenticity and unlocks limited warranty, loyalty points, and early access to drops.\n\n### What products does DIME make?\nAward-winning vapes, flavorful edibles, prerolls, and concentrates. Formats include all-in-one devices, tanks, 510-thread batteries, gummies, softgels, and prerolls across Signature, Live Reserve, Balanced, Rosin, State Exclusive, and Collaborations lines.\n\n### Does DIME offer edibles?\nYes. Shop [edibles](/shop/edibles) including Balanced and Rosin gummies plus softgels. Store cool and dry; shelf life is typically several months.\n\n### What are DIME's top vapes?\nDIME is known for potent, flavorful carts and disposables across Signature and Live Reserve, plus All-in-One devices. Browse [Shop vapes](/shop/vapes) for the current lineup.\n\n### What's in a DIME cartridge — CO2 oil, distillate, or live resin?\nSignature Line uses potent live-resin-infused distillate with cannabis-derived and natural fruit-derived terpenes. Live Reserve blends high-terpene extract with melted diamonds for true-to-strain flavor and high potency.\n\n### Does DIME run sales or a rewards program?\nYes. See [Promotions](/promotions) for current offers. [Rewards](/rewards) members earn points, discounts, and early access when they validate products and shop.\n\n### What is the THC % on my product?\nOfficial packaging includes COA details. You can also review testing on [Lab results](/lab-results).\n\n### Will another brand's battery work with a DIME tank?\nWe recommend a DIME 510 battery — hardware is designed to work together. Most 510 batteries work, but air-draw (buttonless) batteries will not, tanks may need the positive pin extended for contact, some batteries are too weak (use at least 3.7v), and size mismatches can cause blinking lights.\n\n### How do I turn on my battery and adjust heat?\nClick the button five times rapidly to power on/off. Click three times to cycle heat. On many batteries: green is high, blue medium, red low; two clicks starts preheat (rainbow). Charge with USB-C when the button flashes white.\n\n### What is the best way to store or clean my device?\nStore upright at room temperature — avoid excess heat (especially above 95°F) and cars. Clean excess oil, lint, or dust with rubbing alcohol and a cotton wipe.\n\n### What if my device leaks or clogs?\nLeaks often come from heat, upside-down storage, altitude changes, or leaving power on unused. Wipe exterior ports with alcohol; store upright and keep the battery charged. For clogs, use preheat (two clicks), then draw a bit harder. Severe issues: contact support with retailer details, photos, and your scratched validation sticker — or start a return from Account → Orders.\n\n### How can I coordinate an exchange?\nEmail support@dimeindustries.us with your name and contact info, licensed retailer and location, strain and product type, plus photos of packaging, product, and the scratched validation sticker. Online orders can also use Account → Returns.\n\n### What is the shelf life of edibles?\nSeveral months when stored cool and dry.",
    status: "published",
    updatedAt: "2026-08-01T23:00:00.000Z",
  },
  {
    slug: "contact",
    title: "Contact",
    body: "### Contact us\nReach DIME for order help, wholesale, privacy, careers, or general support.\n\n### Email\nsupport@dimeindustries.us\n\nOne inbox for customer support, wholesale, privacy, and careers. Include your order ID from the confirmation email for order issues.\n\n### Authenticity & warranty\nFor product authenticity or warranty activation, use [Validate](/validate) with your package code — do not rely on the contact form alone.\n\n### Find DIME\nLooking for a retailer? Browse [locations](/locations).\n\n### Wholesale\nApply for B2B pricing at [/wholesale](/wholesale).",
    status: "published",
    updatedAt: "2026-08-01T23:00:00.000Z",
  },
  {
    slug: "careers",
    title: "Careers",
    body: "### Careers at DIME\nJoin a team building award-winning cannabis hardware and products — craft, compliance, and brand excellence.\n\n### Build with DIME\nWe're always looking for people who care about reliable devices, regulated markets, and raising the bar on potency and flavor.\n\n### How to apply\nSend a short intro and resume to support@dimeindustries.us with the role you're interested in.\n\n### Culture\nLab-tested standards apply to how we work too — clear ownership, quality over shortcuts, and respect for every jurisdiction we serve.",
    status: "published",
    updatedAt: "2026-08-01T23:00:00.000Z",
  },
  {
    slug: "promotions",
    title: "Promotions",
    body: "### Elevate your experience\nExplore our products to see why we're award-winning — then grab what's on offer. Lab-tested vapes, edibles, and prerolls ready to shop.\n\n### Find DIME deals\nShop online for delivery where available, or use [Find DIME](/locations) for neighborhood retailers stocking current deals.\n\n### Shop now\nBrowse the [full catalog](/shop) or jump straight to [Shop vapes](/shop/vapes) and [edibles](/shop/edibles).\n\n### Current offers\nLive site promotions change with inventory and market — check this page and checkout for active codes. We don't invent one-off deals that aren't running.\n\n### Rewards members\nValidate your products and shop while signed in to earn points toward discounts and early access. Learn more at [Rewards](/rewards).\n\n### Stay notified\nJoin the members newsletter on the homepage for drop alerts.",
    status: "published",
    updatedAt: "2026-08-01T23:00:00.000Z",
  },
  {
    slug: "links",
    title: "Quick Links",
    body: "### Shop\nBrowse the full catalog at [/shop](/shop)\n\n### Validate products\n[/validate](/validate)\n\n### Lab results\n[/lab-results](/lab-results)\n\n### Rewards\n[/rewards](/rewards)\n\n### DIME App\n[/app](/app)\n\n### AI Assistant\n[/assistant](/assistant)\n\n### Find DIME\n[/locations](/locations)\n\n### Wholesale\n[/wholesale](/wholesale)\n\n### Contact\n[/contact](/contact)",
    status: "published",
    updatedAt: "2026-08-01T23:00:00.000Z",
  },
  {
    slug: "legal/terms",
    title: "Terms of Service",
    body: "These Terms of Service govern your use of the DIME Industries storefront at dimeindustries.us (the \"Site\"), including shopping, accounts, product validation, rewards, and related services. By accessing or using the Site you agree to these terms.\n\n### Eligibility & age\nYou confirm you are 21 or older (or a qualifying medical patient where applicable under local law) and that cannabis products are legal for you to purchase and possess in your jurisdiction. We use an age gate and may request additional verification. We may refuse or cancel access if we reasonably believe you do not meet eligibility rules.\n\n### Products & jurisdictions\nCannabis products are offered only where permitted. Availability, formats, and menus vary by state and partner. Delivery and retail fulfillment apply only in supported markets (including California and Massachusetts where noted). Finding a retailer via Find DIME does not guarantee stock or pricing at that location.\n\n### Orders & pricing\nOrders are accepted only where we (or our licensed partners) can legally fulfill them. Prices shown exclude tax until checkout unless stated otherwise. Retail prices may be sourced from licensed marketplace menus (for example Eaze in CA and Rolling Releaf in MA where noted) and can differ by jurisdiction, potency, or format. We may correct pricing or availability errors and cancel affected lines.\n\n### Payment & fulfillment\nPayment methods accepted at checkout are subject to change. Risk of loss for shipped goods passes according to the fulfillment partner’s rules for your order. You are responsible for providing accurate delivery and contact details.\n\n### Accounts & security\nYou are responsible for keeping login credentials secure and for activity under your account. Notify us promptly of unauthorized use. We may suspend accounts for fraud, abuse, chargebacks, or policy violations.\n\n### Product validation & warranty\nPackage validation confirms authenticity and may activate limited warranty coverage for eligible hardware. Validation does not guarantee a refund for every issue. Warranty and exchange paths are described in the Returns Policy and may require photos, retailer details, and a scratched validation code.\n\n### Rewards & promotions\nLoyalty points, tiers, and promotional codes are subject to program rules, stock, and jurisdiction. Points have no cash value except as applied at checkout under published redeem rates. We may adjust, pause, or revoke rewards for abuse or error.\n\n### Intellectual property\nSite content, branding, product names, and media are owned by DIME Industries or its licensors. You may not copy, scrape, or misuse them without permission.\n\n### Prohibited use\nDo not misuse the Site, attempt to bypass age or geo controls, interfere with security, submit false validation claims, or use the Site for unlawful purposes.\n\n### Disclaimers & limitation\nProducts and the Site are provided as available. To the fullest extent permitted by law, DIME disclaims warranties not expressly stated, and limits liability for indirect or consequential damages arising from Site use. Some jurisdictions do not allow certain limitations; those limits apply only to the extent allowed.\n\n### Changes\nWe may update these terms. Continued use after notice constitutes acceptance of the revised terms. The date of the latest CMS update appears in admin records; material changes may also be flagged on the Site.\n\n### Contact\nQuestions about these terms: support@dimeindustries.us or the Contact page.",
    status: "published",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
  {
    slug: "legal/privacy",
    title: "Privacy Policy",
    body: "This Privacy Policy explains how DIME Industries collects, uses, and shares information when you use dimeindustries.us and related services (shopping, accounts, validation, rewards, newsletter, and support).\n\n### What we collect\nWe collect account, order, and device data needed to operate the storefront, process payments, and meet compliance obligations. That can include name, email, phone, shipping and billing addresses, order history, age-verification status, product validation codes you submit, loyalty balances, wishlist and cart activity, support messages, and basic device or browser data (such as IP address, cookies, and approximate location for jurisdiction gating).\n\n### How we use information\nWe use information to fulfill orders, prevent fraud, verify age and jurisdiction, run product validation and warranty workflows, operate Rewards, send transactional email (order and account notices), honor newsletter or marketing preferences you opt into, improve the Site, and comply with law and licensed-partner requirements.\n\n### Cookies & similar tech\nNecessary cookies power cart, age verification, consent records, and signed-in sessions. Analytics and marketing cookies are optional and stay off until you enable them on Cookie preferences. See that page to review or change choices anytime.\n\n### Sharing\nWe share data with service providers who help us run the Site — for example payment processors, fulfillment and marketplace partners, email and hosting providers, and security or error-monitoring tools — under contracts that limit use to providing those services. We may also disclose information when required by law, to protect rights and safety, or in connection with a corporate transaction.\n\n### What we don't do\nWe do not sell personal information. We do not use your data to enable underage purchase. Optional marketing only runs when you have consented via cookies or email preferences.\n\n### Retention\nWe keep account and order records as long as needed for operations, tax, dispute, and legal obligations, then delete or anonymize when no longer required.\n\n### Security\nWe use industry-standard safeguards for transmission and storage. No method is 100% secure; please use a strong unique password and protect your devices.\n\n### Your choices & requests\nYou can update profile and addresses in Account, manage email notifications under Account → Notifications, and control optional cookies on Cookie preferences. For access, correction, or deletion requests where applicable, contact privacy@dimeindustries.us. We may need to verify your identity before fulfilling a request.\n\n### Children\nThe Site is not directed to anyone under 21. We do not knowingly collect personal information from minors.\n\n### Changes\nWe may update this policy. Continued use after posting changes means you accept the updated policy. Material changes may be highlighted on the Site or by email when appropriate.\n\n### Contact\nPrivacy questions and data requests: privacy@dimeindustries.us. General support: support@dimeindustries.us.",
    status: "published",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
  {
    slug: "legal/medical-privacy",
    title: "Medical Privacy Policy",
    body: "This Medical Privacy Policy covers medical-patient information if medical verification or medical-only purchasing flows are enabled on the DIME Industries storefront.\n\n### Launch status\nAt the current flat 21+ launch gate, medical status is optional and unused for access. Age verification alone controls entry. This notice describes how medical data will be treated if or when those flows are turned on.\n\n### What medical information means\nMedical information may include patient card or recommendation identifiers, issuing authority, expiration dates, caregiver designations, and related eligibility flags you voluntarily provide. It is distinct from ordinary account and order data covered by the Privacy Policy.\n\n### How we use medical information\nIf enabled, medical information would be used only to confirm eligibility to purchase where medical access is required or permitted, to apply medical-specific catalog or limit rules, and to meet licensed-partner or regulatory obligations. We would not use medical information for unrelated marketing.\n\n### Access controls\nMedical information is subject to stricter access controls than general account data. Access is limited to systems and personnel who need it for eligibility, fulfillment, compliance, or support related to a medical purchase.\n\n### Sharing\nMedical information would be shared only with licensed fulfillment partners and service providers as needed to complete an eligible order or satisfy legal requirements — not sold, and not used for unrelated advertising.\n\n### Retention\nMedical eligibility records would be retained only as long as needed for the purchase, audit, and legal retention period applicable to that jurisdiction, then deleted or de-identified.\n\n### Your rights\nYou may request access, correction, or deletion of medical information you provided, subject to legal retention duties. Contact privacy@dimeindustries.us and note that the request relates to medical privacy.\n\n### Relationship to other policies\nOrdinary browsing, cart, and adult-use orders remain under the Privacy Policy and Terms of Service. Returns and warranty for products follow the Returns Policy regardless of medical or adult-use status.\n\n### Contact\nMedical privacy questions: privacy@dimeindustries.us. General support: support@dimeindustries.us.",
    status: "published",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
  {
    slug: "legal/returns",
    title: "Returns Policy",
    body: "This Returns Policy explains when DIME Industries may accept exchanges or refunds for products purchased through this storefront or registered via product validation.\n\n### Eligible returns\nDefective hardware may be eligible for exchange or refund when purchased from a licensed source and validated through our product registration flow. Consumable product that has been opened is generally not returnable except where required by law or where we confirm a manufacturing defect.\n\n### What usually qualifies\nHardware that fails under normal use after validation (for example confirmed leaks tied to manufacturing, non-functional batteries or all-in-ones within warranty expectations) may qualify. We review photos, order or retailer proof, and the scratched validation sticker.\n\n### What usually does not qualify\nChange of mind, flavor preference, empty or nearly empty devices, damage from drops or misuse, products stored in extreme heat or upside down contrary to care guidance, counterfeit or unvalidated products, and purchases from unauthorized sellers.\n\n### Online orders — how to request\nSign in and open the paid order under Account → Orders.\n\nSubmit a return request with the reason and details.\n\nTrack status under Account → Returns. Support may approve, deny, or mark the refund complete.\n\n### Retailer purchases\nIf you bought from a licensed retailer, we may coordinate an exchange with that retailer. Email support@dimeindustries.us with your name and contact info, retailer name and location, strain and product type, and photos of packaging, product, and the scratched validation sticker.\n\n### Validation & warranty\nRegistering a product at Validate activates the limited no-hassle warranty path for eligible issues. Validation alone does not guarantee approval of every claim.\n\n### Refunds & timing\nApproved refunds are issued to the original payment method when possible. Timing depends on the payment provider. Store credit or replacement may be offered instead of a cash refund in some cases.\n\n### Rewards points\nIf an item purchased with points is returned and approved, store credit or points restoration equal to the points portion may be applied per Rewards program rules.\n\n### Contact\nInclude photos, retailer details, order ID, and validation code when relevant. Policy questions: support@dimeindustries.us.",
    status: "published",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
  {
    slug: "legal/wholesale-rewards",
    title: "Wholesale Rewards Terms",
    body: "Wholesale rewards, if offered, are available only to approved wholesale accounts in good standing.\n\n### Eligibility\nYou must complete wholesale application and approval before earning or redeeming wholesale incentives. Consumer Rewards on the public storefront are separate.\n\n### Adjustments\nPoints, rebates, or incentives may be adjusted or revoked for policy violations, chargebacks, fraud, or inactive accounts.\n\n### Contact\nProgram details: support@dimeindustries.us.",
    status: "published",
    updatedAt: "2026-08-02T00:00:00.000Z",
  },
  {
    slug: "wholesale",
    title: "Wholesale",
    body: "Apply at /wholesale for DIME B2B pricing. Approved accounts get wholesale tiers with NET-30, NET-60, or Bitcoin upfront.\n\nQuestions: support@dimeindustries.us",
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
];

const DEFAULT_BANNER: HomepageBanner = {
  enabled: true,
  headline: "Elevate your experience",
  body: "Innovation takes center stage — explore award-winning, lab-tested vapes, edibles, and prerolls.",
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

/** Fail open to cookie/defaults when Postgres is slow or pool-exhausted. */
const CMS_DB_READY_TIMEOUT_MS = 4_000;

function mergeMissingDefaultPages(pages: CmsPage[]): CmsPage[] {
  if (pages.length === 0) return DEFAULT_PAGES;
  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  for (const page of DEFAULT_PAGES) {
    const existing = bySlug.get(page.slug);
    if (!existing) {
      bySlug.set(page.slug, page);
      continue;
    }
    // Refresh legal seeds when defaults are newer (admin edits with a later updatedAt win).
    if (page.slug.startsWith("legal/") && page.updatedAt > existing.updatedAt) {
      bySlug.set(page.slug, page);
    }
  }
  return Array.from(bySlug.values());
}

function mergeMissingDefaultPosts(posts: BlogPost[]): BlogPost[] {
  if (posts.length === 0) return DEFAULT_POSTS;
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  for (const post of DEFAULT_POSTS) {
    if (!bySlug.has(post.slug)) bySlug.set(post.slug, post);
  }
  return Array.from(bySlug.values());
}

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

  try {
    return await Promise.race([
      dbCmsReady,
      new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), CMS_DB_READY_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return false;
  }
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
      return publishedOnly(mergeMissingDefaultPages(await dbListCmsPages()), includeDrafts);
    } catch (err) {
      console.error("[cms] list pages failed, using defaults", err);
      return publishedOnly(DEFAULT_PAGES, includeDrafts);
    }
  }
  const { pages } = await readJar();
  return publishedOnly(mergeMissingDefaultPages(pages), includeDrafts);
}

export async function getCmsPage(slug: string, includeDrafts = false): Promise<CmsPage | null> {
  try {
    const pages = await Promise.race([
      listCmsPages(includeDrafts),
      new Promise<CmsPage[]>((_, reject) => {
        setTimeout(() => reject(new Error("cms list timeout")), CMS_DB_READY_TIMEOUT_MS + 1_500);
      }),
    ]);
    const hit = pages.find((p) => p.slug === slug);
    if (hit) return hit;
  } catch (err) {
    console.error("[cms] get page failed, using defaults", err);
  }
  // Built-in seed so nav/footer CMS routes never 404 on incomplete or slow DB/cookie jars.
  const fallback = DEFAULT_PAGES.find((p) => p.slug === slug);
  if (!fallback) return null;
  if (!includeDrafts && fallback.status !== "published") return null;
  return fallback;
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
      return sortPosts(mergeMissingDefaultPosts(await dbListBlogPosts()));
    } catch (err) {
      console.error("[cms] list posts failed, using defaults", err);
      return sortPosts(DEFAULT_POSTS);
    }
  }
  const { posts } = await readJar();
  return sortPosts(mergeMissingDefaultPosts(posts));
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
