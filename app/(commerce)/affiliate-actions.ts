// app/(commerce)/affiliate-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "@/lib/auth/session";
import { requestAffiliatePayout, reviewAffiliatePayout } from "@/lib/affiliate/payouts";

export type AffiliateActionState = { error?: string; success?: string };

export async function requestPayoutAction(
  _prev: AffiliateActionState,
  formData: FormData
): Promise<AffiliateActionState> {
  const profile = await requireUser();
  const amountDollars = Number(formData.get("amountDollars") ?? 0);
  const amountCents = Math.round(amountDollars * 100);
  const result = await requestAffiliatePayout(profile.email, amountCents);
  if (!result.ok) return { error: result.error };
  revalidatePath("/account/affiliate");
  revalidatePath("/admin/affiliate");
  return { success: "Payout request submitted." };
}

export async function adminReviewPayoutAction(
  _prev: AffiliateActionState,
  formData: FormData
): Promise<AffiliateActionState> {
  await requireAdmin();
  const id = String(formData.get("payoutId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "");
  if (decision !== "paid" && decision !== "rejected") return { error: "Invalid decision." };
  const updated = await reviewAffiliatePayout(id, decision, note);
  if (!updated) return { error: "Payout not found or already reviewed." };
  revalidatePath("/admin/affiliate");
  revalidatePath("/account/affiliate");
  return { success: `Payout ${updated.id} marked ${updated.status}.` };
}
