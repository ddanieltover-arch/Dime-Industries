// lib/cms/store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import type { BlogPost, CmsPage, HomepageBanner } from "./types";

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
  seeded: z.boolean().optional(),
});

const DEFAULT_PAGES: CmsPage[] = [
  {
    slug: "about",
    title: "About DIME",
    body: "DIME Enterprise Commerce delivers lab-tested vapes, edibles, and prerolls with published certificates of analysis.\n\nWe launch in California and Massachusetts with jurisdiction-aware catalog controls and adult-use age verification.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "faq",
    title: "FAQ",
    body: "### Is my product authentic?\nValidate codes from licensed packaging in your account.\n\n### Where do you ship?\nCalifornia and Massachusetts at launch, gated by your verified jurisdiction.\n\n### How do I pay?\nBitcoin via Paybis at checkout.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "contact",
    title: "Contact",
    body: "Support: support@dimeindustries.us\n\nWholesale inquiries: wholesale@dimeindustries.us\n\nFor order issues, include your order ID from the confirmation email.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/terms",
    title: "Terms of Service",
    body: "By using this platform you confirm you are 21+ (or a qualifying medical patient where applicable) and that cannabis products are legal in your jurisdiction.\n\nOrders are fulfilled only where permitted. Prices exclude tax until checkout.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/privacy",
    title: "Privacy Policy",
    body: "We collect account, order, and device data needed to operate the storefront, process payments, and meet compliance obligations.\n\nWe do not sell personal information. Contact privacy@dimeindustries.us for data requests.",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    slug: "legal/medical-privacy",
    title: "Medical Privacy",
    body: "If medical patient flows are enabled, medical information is handled under a separate medical privacy notice and access controls.\n\nMedical status is optional and unused at the flat 21+ launch gate.",
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
    slug: "wholesale",
    title: "Wholesale",
    body: "Apply at /wholesale for DIME B2B pricing. Approved accounts get wholesale tiers with NET-30, NET-60, or Bitcoin upfront. Questions: wholesale@dimeindustries.us",
    status: "published",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

const DEFAULT_POSTS: BlogPost[] = [
  {
    slug: "how-we-publish-coas",
    title: "How we publish certificates of analysis",
    excerpt: "Every active SKU links to lab results so potency is never a surprise.",
    body: "Transparency is the product. Each batch carries THC/CBD metadata on the card and a COA link on the product page.\n\nUntil our external COA host API is connected, links use configured placeholders that will swap to live records without a storefront redesign.",
    status: "published",
    publishedAt: "2026-06-15T00:00:00.000Z",
    updatedAt: "2026-06-15T00:00:00.000Z",
  },
  {
    slug: "shopping-by-potency",
    title: "Shopping by potency, not just strain",
    excerpt: "Why our filters treat THC bands as first-class discovery.",
    body: "Inspired by marketplace UX research, potency bands sit alongside strain and format filters so you can find the session you want faster.\n\nCombine potency with line collections like Live Reserve or Signature for a tighter browse.",
    status: "published",
    publishedAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

const DEFAULT_BANNER: HomepageBanner = {
  enabled: true,
  headline: "Lab-tested drops, potency first",
  body: "Browse by strain, format, and THC band. Every charge is itemized before you pay.",
  ctaLabel: "Shop catalog",
  ctaHref: "/shop",
};

type CmsJar = {
  pages: CmsPage[];
  posts: BlogPost[];
  banner: HomepageBanner;
};

async function readJar(): Promise<CmsJar> {
  const store = await cookies();
  const raw = store.get(CMS_COOKIE)?.value;
  if (!raw) {
    return { pages: DEFAULT_PAGES, posts: DEFAULT_POSTS, banner: DEFAULT_BANNER };
  }
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success) {
      return { pages: DEFAULT_PAGES, posts: DEFAULT_POSTS, banner: DEFAULT_BANNER };
    }
    return {
      pages: parsed.data.pages.length ? parsed.data.pages : DEFAULT_PAGES,
      posts: parsed.data.posts.length ? parsed.data.posts : DEFAULT_POSTS,
      banner: parsed.data.banner,
    };
  } catch {
    return { pages: DEFAULT_PAGES, posts: DEFAULT_POSTS, banner: DEFAULT_BANNER };
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

async function useDbCms(): Promise<boolean> {
  const { isGrowthDatabaseMode } = await import("@/lib/db/growth-mode");
  if (!isGrowthDatabaseMode()) return false;
  const { dbSeedCmsIfEmpty } = await import("./cms-db");
  await dbSeedCmsIfEmpty(DEFAULT_PAGES, DEFAULT_POSTS, DEFAULT_BANNER);
  return true;
}

export async function listCmsPages(includeDrafts = false): Promise<CmsPage[]> {
  if (await useDbCms()) {
    const { dbListCmsPages } = await import("./cms-db");
    const pages = await dbListCmsPages();
    return includeDrafts ? pages : pages.filter((p) => p.status === "published");
  }
  const { pages } = await readJar();
  return includeDrafts ? pages : pages.filter((p) => p.status === "published");
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
  if (await useDbCms()) {
    const { dbListBlogPosts } = await import("./cms-db");
    const posts = await dbListBlogPosts();
    const list = includeDrafts ? posts : posts.filter((p) => p.status === "published");
    return list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
  const { posts } = await readJar();
  const list = includeDrafts ? posts : posts.filter((p) => p.status === "published");
  return list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
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
  if (await useDbCms()) {
    const { dbGetBanner } = await import("./cms-db");
    return (await dbGetBanner()) ?? DEFAULT_BANNER;
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
