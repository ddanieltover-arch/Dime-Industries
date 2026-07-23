// app/(admin)/growth-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { appendAudit } from "@/lib/admin/audit";
import {
  getHomepageBanner,
  listBlogPosts,
  saveHomepageBanner,
  upsertBlogPost,
  upsertCmsPage,
} from "@/lib/cms/store";
import { listCoupons, upsertCoupon } from "@/lib/coupons/store";
import { normalizeCouponCode } from "@/lib/coupons/logic";
import type { Coupon } from "@/lib/coupons/types";
import { adjustLoyaltyPoints } from "@/lib/loyalty/store";
import type { AdminActionState } from "./actions";

function revalidateGrowth() {
  revalidatePath("/admin/cms");
  revalidatePath("/admin/blog");
  revalidatePath("/admin/coupons");
  revalidatePath("/admin/loyalty");
  revalidatePath("/admin/affiliate");
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/about");
  revalidatePath("/faq");
  revalidatePath("/contact");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function saveCmsPageAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim().replace(/^\/+/, "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const status = String(formData.get("status") ?? "draft");
  if (!slug || !title) return { error: "Slug and title are required." };
  if (!["draft", "published"].includes(status)) return { error: "Invalid status." };

  await upsertCmsPage({
    slug,
    title,
    body,
    status: status as "draft" | "published",
    updatedAt: new Date().toISOString(),
  });
  await appendAudit({
    actorEmail: admin.email,
    action: "cms_page_upsert",
    entity: "cms",
    entityId: slug,
    detail: status,
  });
  revalidateGrowth();
  revalidatePath(`/${slug}`);
  return { success: true, message: "Page saved." };
}

export async function saveBlogPostAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const status = String(formData.get("status") ?? "draft");
  if (!slug || !title) return { error: "Slug and title are required." };
  if (!["draft", "published"].includes(status)) return { error: "Invalid status." };

  const existing = (await listBlogPosts(true)).find((p) => p.slug === slug);
  const now = new Date().toISOString();
  await upsertBlogPost({
    slug,
    title,
    excerpt: excerpt || title,
    body,
    status: status as "draft" | "published",
    publishedAt: existing?.publishedAt ?? now,
    updatedAt: now,
  });
  await appendAudit({
    actorEmail: admin.email,
    action: "blog_upsert",
    entity: "blog",
    entityId: slug,
    detail: status,
  });
  revalidateGrowth();
  revalidatePath(`/blog/${slug}`);
  return { success: true, message: "Post saved." };
}

export async function saveBannerAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const current = await getHomepageBanner();
  await saveHomepageBanner({
    enabled: formData.get("enabled") === "on",
    headline: String(formData.get("headline") ?? current.headline).trim() || current.headline,
    body: String(formData.get("body") ?? current.body).trim() || current.body,
    ctaLabel: String(formData.get("ctaLabel") ?? current.ctaLabel).trim() || current.ctaLabel,
    ctaHref: String(formData.get("ctaHref") ?? current.ctaHref).trim() || current.ctaHref,
  });
  await appendAudit({
    actorEmail: admin.email,
    action: "banner_update",
    entity: "cms",
    entityId: "homepage-banner",
    detail: "updated",
  });
  revalidateGrowth();
  return { success: true, message: "Banner saved." };
}

export async function saveCouponAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim() || `cpn_${crypto.randomUUID().slice(0, 8)}`;
  const code = normalizeCouponCode(String(formData.get("code") ?? ""));
  const type = String(formData.get("type") ?? "percentage");
  const value = Number(formData.get("value"));
  const minSubtotalCents = Math.round(Number(formData.get("minSubtotalCents") ?? 0));
  if (!code) return { error: "Code is required." };
  if (!["percentage", "fixed"].includes(type)) return { error: "Invalid type." };
  if (!Number.isFinite(value) || value < 0) return { error: "Invalid value." };
  if (type === "percentage" && value > 100) return { error: "Percentage cannot exceed 100." };

  const existing = (await listCoupons()).find((c) => c.id === id);
  const coupon: Coupon = {
    id,
    code,
    type: type as Coupon["type"],
    value: Math.round(value),
    minSubtotalCents: Number.isFinite(minSubtotalCents) ? Math.max(0, minSubtotalCents) : 0,
    active: formData.get("active") === "on",
    startsAt: existing?.startsAt ?? null,
    endsAt: existing?.endsAt ?? null,
    usageLimit: existing?.usageLimit ?? null,
    usedCount: existing?.usedCount ?? 0,
  };
  await upsertCoupon(coupon);
  await appendAudit({
    actorEmail: admin.email,
    action: "coupon_upsert",
    entity: "coupons",
    entityId: coupon.id,
    detail: coupon.code,
  });
  revalidateGrowth();
  return { success: true, message: "Coupon saved." };
}

export async function adjustLoyaltyAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const delta = Number(formData.get("delta"));
  const reason = String(formData.get("reason") ?? "").trim() || "Admin adjustment";
  if (!email.includes("@")) return { error: "Valid email required." };
  if (!Number.isFinite(delta) || delta === 0) return { error: "Non-zero delta required." };

  await adjustLoyaltyPoints(email, Math.round(delta), reason);
  await appendAudit({
    actorEmail: admin.email,
    action: "loyalty_adjust",
    entity: "loyalty",
    entityId: email,
    detail: `${delta} — ${reason}`,
  });
  revalidateGrowth();
  return { success: true, message: "Loyalty adjusted." };
}
