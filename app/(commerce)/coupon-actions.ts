// app/(commerce)/coupon-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getCartSnapshot } from "@/lib/cart";
import { applyCouponCode, setAppliedCouponCode } from "@/lib/coupons/store";

export type CouponActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function applyCoupon(
  _prev: CouponActionState,
  formData: FormData
): Promise<CouponActionState> {
  const code = String(formData.get("code") ?? "");
  const cart = await getCartSnapshot();
  const result = await applyCouponCode(code, cart.subtotalCents);
  if ("error" in result) return { error: result.error };
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { success: true, message: `Applied ${result.label}` };
}

export async function removeCoupon(): Promise<void> {
  await setAppliedCouponCode(null);
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
