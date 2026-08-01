// lib/cms/cms-db.ts
import "server-only";
import { desc, eq } from "drizzle-orm";
import { commerceBlogPosts, commerceCmsPages, siteSettings } from "@/db/schema";
import { getDb } from "@/lib/db/client";
import { normalizeHomepageLayout } from "./homepage-layout";
import type { BlogPost, CmsPage, HomepageBanner, HomepageLayout } from "./types";

const BANNER_KEY = "homepage_banner";
const LAYOUT_KEY = "homepage_layout";

export async function dbListCmsPages(): Promise<CmsPage[]> {
  const db = getDb();
  const rows = await db.select().from(commerceCmsPages);
  return rows.map((r) => {
    const updatedAt =
      r.updatedAt instanceof Date && !Number.isNaN(r.updatedAt.getTime())
        ? r.updatedAt.toISOString()
        : new Date(0).toISOString();
    return {
      slug: r.slug,
      title: r.title,
      body: r.body,
      status: r.status as CmsPage["status"],
      updatedAt,
    };
  });
}

export async function dbUpsertCmsPage(page: CmsPage): Promise<void> {
  const db = getDb();
  await db
    .insert(commerceCmsPages)
    .values({
      slug: page.slug,
      title: page.title,
      body: page.body,
      status: page.status,
      updatedAt: new Date(page.updatedAt),
    })
    .onConflictDoUpdate({
      target: commerceCmsPages.slug,
      set: {
        title: page.title,
        body: page.body,
        status: page.status,
        updatedAt: new Date(page.updatedAt),
      },
    });
}

export async function dbListBlogPosts(): Promise<BlogPost[]> {
  const db = getDb();
  const rows = await db.select().from(commerceBlogPosts).orderBy(desc(commerceBlogPosts.publishedAt));
  return rows.map((r) => {
    const publishedAt =
      r.publishedAt instanceof Date && !Number.isNaN(r.publishedAt.getTime())
        ? r.publishedAt.toISOString()
        : new Date(0).toISOString();
    const updatedAt =
      r.updatedAt instanceof Date && !Number.isNaN(r.updatedAt.getTime())
        ? r.updatedAt.toISOString()
        : publishedAt;
    return {
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      body: r.body,
      status: r.status as BlogPost["status"],
      publishedAt,
      updatedAt,
    };
  });
}

export async function dbUpsertBlogPost(post: BlogPost): Promise<void> {
  const db = getDb();
  await db
    .insert(commerceBlogPosts)
    .values({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      status: post.status,
      publishedAt: new Date(post.publishedAt),
      updatedAt: new Date(post.updatedAt),
    })
    .onConflictDoUpdate({
      target: commerceBlogPosts.slug,
      set: {
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        status: post.status,
        publishedAt: new Date(post.publishedAt),
        updatedAt: new Date(post.updatedAt),
      },
    });
}

export async function dbGetBanner(): Promise<HomepageBanner | null> {
  const db = getDb();
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, BANNER_KEY)).limit(1);
  const value = rows[0]?.value;
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.headline !== "string") return null;
  return {
    enabled: Boolean(v.enabled),
    headline: String(v.headline),
    body: String(v.body ?? ""),
    ctaLabel: String(v.ctaLabel ?? "Shop now"),
    ctaHref: String(v.ctaHref ?? "/shop"),
  };
}

export async function dbSaveBanner(banner: HomepageBanner): Promise<void> {
  const db = getDb();
  await db
    .insert(siteSettings)
    .values({ key: BANNER_KEY, value: banner })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: banner },
    });
}

export async function dbGetHomepageLayout(): Promise<HomepageLayout | null> {
  const db = getDb();
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, LAYOUT_KEY)).limit(1);
  const value = rows[0]?.value;
  if (!value || typeof value !== "object") return null;
  return normalizeHomepageLayout(value);
}

export async function dbSaveHomepageLayout(layout: HomepageLayout): Promise<void> {
  const db = getDb();
  const normalized = normalizeHomepageLayout(layout);
  await db
    .insert(siteSettings)
    .values({ key: LAYOUT_KEY, value: normalized })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: normalized },
    });
}

export async function dbSeedCmsIfEmpty(
  pages: CmsPage[],
  posts: BlogPost[],
  banner: HomepageBanner,
  layout: HomepageLayout
): Promise<void> {
  // Insert any missing default slugs (do not overwrite admin edits).
  const existing = await dbListCmsPages();
  const existingSlugs = new Set(existing.map((p) => p.slug));
  for (const page of pages) {
    if (!existingSlugs.has(page.slug)) await dbUpsertCmsPage(page);
  }
  const existingPosts = await dbListBlogPosts();
  const existingPostSlugs = new Set(existingPosts.map((p) => p.slug));
  for (const post of posts) {
    if (!existingPostSlugs.has(post.slug)) await dbUpsertBlogPost(post);
  }
  const existingBanner = await dbGetBanner();
  if (!existingBanner) await dbSaveBanner(banner);
  const existingLayout = await dbGetHomepageLayout();
  if (!existingLayout) await dbSaveHomepageLayout(layout);
}
