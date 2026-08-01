// lib/admin/site-settings-store.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { LAUNCH_JURISDICTIONS } from "@/lib/compliance/jurisdictions";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";

export const SITE_SETTINGS_COOKIE = "dime_site_settings";

const flagsSchema = z.object({
  wholesaleEnabled: z.boolean(),
  vendorOnboarding: z.boolean(),
});

/** Ops settings only — age gate min age is code-defined (`SITE_MIN_AGE`), not stored here. */
const settingsSchema = z.object({
  jurisdictions: z.array(z.string()).min(1),
  featureFlags: flagsSchema,
});

export type SiteOpsSettings = z.infer<typeof settingsSchema>;

export const DEFAULT_SITE_SETTINGS: SiteOpsSettings = {
  jurisdictions: [...LAUNCH_JURISDICTIONS],
  featureFlags: {
    wholesaleEnabled: true,
    vendorOnboarding: false,
  },
};

async function readCookie(): Promise<SiteOpsSettings> {
  const store = await cookies();
  const raw = store.get(SITE_SETTINGS_COOKIE)?.value;
  if (!raw) return DEFAULT_SITE_SETTINGS;
  try {
    const parsed = settingsSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data : DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

async function writeCookie(settings: SiteOpsSettings): Promise<void> {
  const store = await cookies();
  store.set(SITE_SETTINGS_COOKIE, encodeURIComponent(JSON.stringify(settings)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

async function readDb(): Promise<SiteOpsSettings> {
  const { getDb } = await import("@/lib/db/client");
  const { siteSettings } = await import("@/db/schema");
  const db = getDb();
  const rows = await db.select().from(siteSettings);
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  const jurisdictionsRaw = byKey.get("launch_jurisdictions");
  const flagsRaw = byKey.get("feature_flags");

  let jurisdictions = DEFAULT_SITE_SETTINGS.jurisdictions;
  if (Array.isArray(jurisdictionsRaw)) {
    jurisdictions = jurisdictionsRaw.map(String);
  } else if (typeof jurisdictionsRaw === "string") {
    try {
      const parsed = JSON.parse(jurisdictionsRaw);
      if (Array.isArray(parsed)) jurisdictions = parsed.map(String);
    } catch {
      // keep default
    }
  }

  let featureFlags = DEFAULT_SITE_SETTINGS.featureFlags;
  if (flagsRaw && typeof flagsRaw === "object" && !Array.isArray(flagsRaw)) {
    const f = flagsRaw as Record<string, unknown>;
    featureFlags = {
      wholesaleEnabled: Boolean(f.wholesale_enabled ?? f.wholesaleEnabled ?? true),
      vendorOnboarding: Boolean(f.vendor_onboarding ?? f.vendorOnboarding ?? false),
    };
  } else if (typeof flagsRaw === "string") {
    try {
      const f = JSON.parse(flagsRaw) as Record<string, unknown>;
      featureFlags = {
        wholesaleEnabled: Boolean(f.wholesale_enabled ?? f.wholesaleEnabled ?? true),
        vendorOnboarding: Boolean(f.vendor_onboarding ?? f.vendorOnboarding ?? false),
      };
    } catch {
      // keep default
    }
  }

  const parsed = settingsSchema.safeParse({ jurisdictions, featureFlags });
  return parsed.success ? parsed.data : DEFAULT_SITE_SETTINGS;
}

async function writeDb(settings: SiteOpsSettings): Promise<void> {
  const { getDb } = await import("@/lib/db/client");
  const { siteSettings } = await import("@/db/schema");
  const db = getDb();
  const rows: { key: string; value: unknown }[] = [
    { key: "launch_jurisdictions", value: settings.jurisdictions },
    {
      key: "feature_flags",
      value: {
        wholesale_enabled: settings.featureFlags.wholesaleEnabled,
        vendor_onboarding: settings.featureFlags.vendorOnboarding,
      },
    },
  ];
  for (const row of rows) {
    await db
      .insert(siteSettings)
      .values({ key: row.key, value: row.value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: row.value },
      });
  }
}

export async function getSiteSettings(): Promise<SiteOpsSettings> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return DEFAULT_SITE_SETTINGS;
  }
  if (isGrowthDatabaseMode()) {
    try {
      return await readDb();
    } catch (err) {
      console.error("[site-settings] db read failed", err);
      return DEFAULT_SITE_SETTINGS;
    }
  }
  return readCookie();
}

export async function saveSiteSettings(settings: SiteOpsSettings): Promise<void> {
  const parsed = settingsSchema.parse(settings);
  if (isGrowthDatabaseMode()) {
    await writeDb(parsed);
    return;
  }
  await writeCookie(parsed);
}

export async function isWholesaleEnabled(): Promise<boolean> {
  return (await getSiteSettings()).featureFlags.wholesaleEnabled;
}
