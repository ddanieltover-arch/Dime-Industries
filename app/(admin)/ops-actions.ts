// app/(admin)/ops-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { appendAudit } from "@/lib/admin/audit";
import { saveCategoryOverride } from "@/lib/admin/categories-store";
import { saveSiteSettings, type SiteOpsSettings } from "@/lib/admin/site-settings-store";
import { LAUNCH_JURISDICTIONS, isLaunchJurisdiction } from "@/lib/compliance/jurisdictions";
import type { AdminActionState } from "./actions";

function revalidateOps() {
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/settings");
  revalidatePath("/shop");
  revalidatePath("/wholesale");
  revalidatePath("/");
}

export async function saveCategoryAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder"));
  const hidden = formData.get("hidden") === "on";
  if (!slug) return { error: "Missing category slug." };
  if (!name) return { error: "Name is required." };
  if (!Number.isFinite(sortOrder)) return { error: "Invalid sort order." };

  await saveCategoryOverride(slug, {
    name,
    sortOrder: Math.round(sortOrder),
    hidden,
  });
  await appendAudit({
    actorEmail: admin.email,
    action: "category_update",
    entity: "categories",
    entityId: slug,
    detail: hidden ? "hidden" : "visible",
  });
  revalidateOps();
  return { success: true, message: "Category saved." };
}

export async function saveSiteSettingsAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  const jurisdictionsRaw = formData
    .getAll("jurisdiction")
    .map((v) => String(v).trim().toUpperCase())
    .filter(Boolean);
  // Backward-compatible with older comma-separated field if present.
  const fromText = String(formData.get("jurisdictions") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const jurisdictions = [...new Set([...jurisdictionsRaw, ...fromText])].filter(isLaunchJurisdiction);
  if (!jurisdictions.length) {
    return { error: `Select at least one launch market: ${LAUNCH_JURISDICTIONS.join(", ")}.` };
  }

  const settings: SiteOpsSettings = {
    jurisdictions,
    featureFlags: {
      wholesaleEnabled: formData.get("wholesaleEnabled") === "on",
      vendorOnboarding: formData.get("vendorOnboarding") === "on",
    },
  };

  await saveSiteSettings(settings);
  await appendAudit({
    actorEmail: admin.email,
    action: "site_settings_update",
    entity: "settings",
    entityId: "site",
    detail: `jurisdictions=${settings.jurisdictions.join("|")}`,
  });
  revalidateOps();
  return { success: true, message: "Settings saved." };
}
