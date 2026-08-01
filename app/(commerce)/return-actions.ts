// app/(commerce)/return-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { requestReturn, reviewReturn } from "@/lib/returns/store";

export type ReturnActionState = { error?: string; success?: string };

export async function requestReturnAction(
  _prev: ReturnActionState,
  formData: FormData
): Promise<ReturnActionState> {
  const profile = await requireUser();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "");
  const result = await requestReturn({
    orderId,
    email: profile.email,
    reason,
    details,
  });
  if (!result.ok) return { error: result.error };

  try {
    const { notifyReturnRequest } = await import("@/lib/email/notifications");
    await notifyReturnRequest({
      id: result.request.id,
      orderId: result.request.orderId,
      email: result.request.email,
      reason: result.request.reason,
    });
  } catch (err) {
    console.warn("[returns] request email failed", err);
  }

  revalidatePath("/account/returns");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/admin/returns");
  return { success: "Return request submitted. We'll email you when it's reviewed." };
}

export async function adminReviewReturnAction(
  _prev: ReturnActionState,
  formData: FormData
): Promise<ReturnActionState> {
  await requireAdmin();
  const id = String(formData.get("returnId") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const note = String(formData.get("note") ?? "");
  if (decision !== "approved" && decision !== "denied" && decision !== "refunded") {
    return { error: "Invalid decision." };
  }
  const updated = await reviewReturn(id, decision, note);
  if (!updated) return { error: "Return not found or cannot move to that status." };
  revalidatePath("/admin/returns");
  revalidatePath("/account/returns");
  revalidatePath(`/account/orders/${updated.orderId}`);
  return { success: `Return ${updated.id} marked ${updated.status}.` };
}
