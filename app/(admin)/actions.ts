// app/(admin)/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  adjustInventory,
  clearProductOverride,
  getAdminProduct,
  patchProductOverride,
} from "@/lib/admin/catalog-overrides";
import { appendAudit } from "@/lib/admin/audit";
import { isAdminOrderStatus, setAdminOrderStatus } from "@/lib/admin/orders-admin";
import { setReviewStatus } from "@/lib/admin/reviews-store";

export type AdminActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}

export async function updateAdminProduct(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  if (!productId) return { error: "Missing product." };
  if (!["draft", "active", "archived"].includes(status)) {
    return { error: "Invalid status." };
  }

  const product = await getAdminProduct(productId);
  if (!product) return { error: "Product not found." };

  await patchProductOverride(productId, {
    name: name || product.name,
    status: status as "draft" | "active" | "archived",
  });

  await appendAudit({
    actorEmail: admin.email,
    action: "product_override",
    entity: "products",
    entityId: productId,
    detail: `status=${status}`,
  });

  revalidateAdmin();
  return { success: true, message: "Override saved." };
}

export async function updateAdminVariantPrice(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const variantId = String(formData.get("variantId") ?? "");
  const price = Number(formData.get("priceCents"));
  if (!productId || !variantId || !Number.isFinite(price) || price < 0) {
    return { error: "Invalid price update." };
  }

  await patchProductOverride(productId, {
    variants: { [variantId]: { retailPriceCents: Math.round(price) } },
  });

  await appendAudit({
    actorEmail: admin.email,
    action: "variant_price_update",
    entity: "product_variants",
    entityId: variantId,
    detail: `priceCents=${Math.round(price)}`,
  });

  revalidateAdmin();
  return { success: true, message: "Price override saved." };
}

export async function clearAdminProductOverride(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return { error: "Missing product." };

  const product = await getAdminProduct(productId);
  if (!product) return { error: "Product not found in catalog." };

  const cleared = await clearProductOverride(productId);
  if (!cleared) return { error: "No override to clear." };

  await appendAudit({
    actorEmail: admin.email,
    action: "product_override_clear",
    entity: "products",
    entityId: productId,
    detail: "cleared",
  });

  revalidateAdmin();
  return { success: true, message: "Override cleared — catalog base restored." };
}

export async function updateAdminInventory(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const variantId = String(formData.get("variantId") ?? "");
  const qty = Number(formData.get("quantityOnHand"));
  if (!productId || !variantId || !Number.isFinite(qty) || qty < 0) {
    return { error: "Invalid inventory quantity." };
  }

  await adjustInventory(productId, variantId, Math.floor(qty));
  await appendAudit({
    actorEmail: admin.email,
    action: "inventory_adjust",
    entity: "inventory",
    entityId: variantId,
    detail: `qty=${Math.floor(qty)}`,
  });

  revalidateAdmin();
  return { success: true, message: "Inventory updated." };
}

export async function updateAdminOrderStatus(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isAdminOrderStatus(status)) return { error: "Invalid order status." };

  const updated = await setAdminOrderStatus(orderId, status);
  if (!updated) return { error: "Order not found in this browser session." };

  await appendAudit({
    actorEmail: admin.email,
    action: "order_status_update",
    entity: "orders",
    entityId: orderId,
    detail: `status=${status}`,
  });

  revalidateAdmin();
  revalidatePath("/account/orders");
  return { success: true, message: "Order status updated." };
}

export async function moderateReview(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const reviewId = String(formData.get("reviewId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["approved", "rejected", "pending"].includes(status)) {
    return { error: "Invalid review status." };
  }

  const updated = await setReviewStatus(
    reviewId,
    status as "approved" | "rejected" | "pending"
  );
  if (!updated) return { error: "Review not found." };

  await appendAudit({
    actorEmail: admin.email,
    action: "review_moderate",
    entity: "reviews",
    entityId: reviewId,
    detail: `status=${status}`,
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  if (updated.productSlug) {
    revalidatePath(`/product/${updated.productSlug}`);
  }
  return { success: true, message: `Review marked ${status}.` };
}
