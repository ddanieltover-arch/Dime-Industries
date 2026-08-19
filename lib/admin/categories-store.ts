// lib/admin/categories-store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import { withTimeout } from "@/lib/async/with-timeout";
import {
  applyCategoryNameOverrides,
  type CategoryOverride,
  type CategoryOverrides,
} from "@/lib/admin/categories-logic";

export const CATEGORIES_COOKIE = "dime_admin_categories";
const SETTINGS_KEY = "category_overrides";

export type { CategoryOverride, CategoryOverrides };
export { applyCategoryNameOverrides };

const overrideSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  sortOrder: z.number().int().optional(),
  hidden: z.boolean().optional(),
});

const jarSchema = z.object({
  categories: z.record(overrideSchema),
});

export type AdminCategoryRow = {
  slug: string;
  name: string;
  productCount: number;
  activeCount: number;
  sortOrder: number;
  hidden: boolean;
  href: string;
};

async function readCookie(): Promise<CategoryOverrides> {
  const store = await cookies();
  const raw = store.get(CATEGORIES_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = jarSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.categories : {};
  } catch {
    return {};
  }
}

async function writeCookie(categories: CategoryOverrides): Promise<void> {
  const store = await cookies();
  store.set(CATEGORIES_COOKIE, encodeURIComponent(JSON.stringify({ categories })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

async function readDb(): Promise<CategoryOverrides> {
  const { getDb } = await import("@/lib/db/client");
  const { siteSettings } = await import("@/db/schema");
  const db = getDb();
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, SETTINGS_KEY)).limit(1);
  const value = rows[0]?.value;
  if (!value || typeof value !== "object") return {};
  const parsed = jarSchema.safeParse({ categories: value });
  return parsed.success ? parsed.data.categories : {};
}

async function writeDb(categories: CategoryOverrides): Promise<void> {
  const { getDb } = await import("@/lib/db/client");
  const { siteSettings } = await import("@/db/schema");
  const db = getDb();
  await db
    .insert(siteSettings)
    .values({ key: SETTINGS_KEY, value: categories })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: categories },
    });
}

export async function getCategoryOverrides(): Promise<CategoryOverrides> {
  if (process.env.NEXT_PHASE === "phase-production-build") return {};
  if (isGrowthDatabaseMode()) {
    try {
      return await withTimeout(readDb(), 2_000, "category-overrides");
    } catch (err) {
      console.error("[categories] db read failed", err);
      return {};
    }
  }
  return readCookie();
}

export async function saveCategoryOverride(
  slug: string,
  patch: CategoryOverride
): Promise<void> {
  const current = await getCategoryOverrides();
  const next: CategoryOverrides = {
    ...current,
    [slug]: { ...current[slug], ...patch },
  };
  if (isGrowthDatabaseMode()) {
    await writeDb(next);
    return;
  }
  await writeCookie(next);
}

export async function listAdminCategories(): Promise<AdminCategoryRow[]> {
  // Dynamic import avoids a circular dep with catalog-overrides.
  const { getAdminCatalog } = await import("@/lib/admin/catalog-overrides");
  const [catalog, overrides] = await Promise.all([getAdminCatalog(), getCategoryOverrides()]);
  const bySlug = new Map<
    string,
    { name: string; productCount: number; activeCount: number }
  >();

  for (const product of catalog) {
    const slug = product.categorySlug;
    const row = bySlug.get(slug) ?? {
      name: product.categoryName,
      productCount: 0,
      activeCount: 0,
    };
    row.productCount += 1;
    if (product.status === "active") row.activeCount += 1;
    bySlug.set(slug, row);
  }

  const rows: AdminCategoryRow[] = Array.from(bySlug.entries()).map(([slug, base], index) => {
    const o = overrides[slug];
    return {
      slug,
      name: o?.name?.trim() || base.name,
      productCount: base.productCount,
      activeCount: base.activeCount,
      sortOrder: o?.sortOrder ?? index,
      hidden: Boolean(o?.hidden),
      href: `/shop/${slug}`,
    };
  });

  return rows.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}
