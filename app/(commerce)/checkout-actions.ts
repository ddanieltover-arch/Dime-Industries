// app/(commerce)/checkout-actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getAgeGateState, isLaunchJurisdiction } from "@/lib/compliance/age-gate";
import { getCartSnapshot, persistCartLines } from "@/lib/cart";
import {
  computePricing,
  checkoutFormSchema,
  getOrderRepository,
  type CheckoutAddress,
} from "@/lib/checkout";
import { resolveAppliedCoupon, setAppliedCouponCode } from "@/lib/coupons/store";
import { getPaymentProvider } from "@/lib/payments";
import { earnLoyaltyPoints } from "@/lib/loyalty/store";
import { attributeAffiliateConversion } from "@/lib/affiliate/store";

export type CheckoutActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function appBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function startCheckout(
  _prev: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const gate = await getAgeGateState();
  if (!gate.ageVerified) {
    return { error: "Age verification is required before checkout." };
  }

  const raw = {
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "US"),
    paymentMethod: String(formData.get("paymentMethod") ?? "paybis_btc"),
    confirmAge: formData.get("confirmAge") === "on" ? "on" : "",
  };

  const parsed = checkoutFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  if (!isLaunchJurisdiction(data.state)) {
    return { error: "Shipping is only available in California and Massachusetts." };
  }
  // Shipping state is the jurisdiction of record when the age gate no longer
  // collects it up front. Keep any existing cookie in sync.
  const jurisdiction = data.state;
  if (gate.jurisdiction && gate.jurisdiction !== jurisdiction) {
    return {
      error: `Shipping state must match your verified jurisdiction (${gate.jurisdiction}).`,
    };
  }
  try {
    const store = await cookies();
    store.set("dime_jurisdiction", jurisdiction, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } catch (err) {
    console.warn("[checkout] jurisdiction cookie write failed", err);
  }

  const cart = await getCartSnapshot();
  if (cart.lines.length === 0) {
    return { error: "Your cart is empty." };
  }

  // Soft inventory check — full reservation runs when DATABASE_URL growth mode is on
  for (const line of cart.lines) {
    if (line.quantity > line.maxQuantity) {
      return {
        error: `${line.productName} (${line.weightOrFormat}) exceeds available stock.`,
      };
    }
  }

  const address: CheckoutAddress = {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2 || undefined,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
  };

  const coupon = await resolveAppliedCoupon(
    cart.lines.reduce((s, l) => s + l.quantity * l.unitPriceCents, 0)
  );
  const afterCoupon = Math.max(
    0,
    cart.lines.reduce((s, l) => s + l.quantity * l.unitPriceCents, 0) - (coupon?.discountCents ?? 0)
  );
  const { resolveLoyaltyRedeem } = await import("@/lib/loyalty/session-redeem");
  const loyalty = await resolveLoyaltyRedeem({
    email: data.email,
    subtotalAfterCouponCents: afterCoupon,
  });
  const pricing = computePricing(cart.lines, jurisdiction, coupon, loyalty);
  const orders = getOrderRepository();
  const order = await orders.create({
    email: data.email,
    address,
    jurisdiction,
    lines: cart.lines,
    pricing,
    paymentMethod: data.paymentMethod,
  });

  const { reserveInventoryForOrder, releaseInventoryForOrder } = await import("@/lib/inventory");
  const reserved = await reserveInventoryForOrder(
    order.id,
    cart.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }))
  );
  if (!reserved.ok) {
    await orders.update(order.id, { status: "cancelled" });
    await releaseInventoryForOrder(order.id);
    return { error: reserved.error };
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");

  // Direct Bitcoin wallet instructions (Paybis is a how-to on that page).
  if (data.paymentMethod === "paybis_btc") {
    redirect(`/checkout/bitcoin/${order.id}`);
  }

  // Manual rails — confirmation shows payment handles; ops verifies offline.
  const { isManualPaymentMethod } = await import("@/lib/payments/methods");
  if (isManualPaymentMethod(data.paymentMethod)) {
    redirect(`/checkout/confirmation/${order.id}`);
  }

  const provider = getPaymentProvider();
  const base = appBaseUrl();
  const session = await provider.createSession({
    orderId: order.id,
    amountCents: order.totalCents,
    currency: "USD",
    customerEmail: order.email,
    successUrl: `${base}/checkout/confirmation/${order.id}?paid=1`,
    failureUrl: `${base}/checkout?error=payment_failed&orderId=${order.id}`,
    metadata: { jurisdiction: order.jurisdiction },
  });

  await orders.update(order.id, {
    paymentRequestId: session.requestId,
    paymentMode: session.mode,
  });

  redirect(session.checkoutUrl);
}

export async function completeMockPayment(orderId: string): Promise<{ error?: string }> {
  const gate = await getAgeGateState();
  if (!gate.ageVerified) return { error: "Age verification required." };

  const orders = getOrderRepository();
  const order = await orders.getById(orderId);
  if (!order) return { error: "Order not found." };
  if (order.paymentMode !== "mock") return { error: "Not a mock payment session." };
  if (order.status === "payment_confirmed") {
    redirect(`/checkout/confirmation/${order.id}`);
  }

  await orders.markPaid(orderId);
  await persistCartLines([]);
  await setAppliedCouponCode(null);
  const { setRequestedRedeemPoints } = await import("@/lib/loyalty/session-redeem");
  await setRequestedRedeemPoints(0);

  try {
    const { commitInventoryForOrder } = await import("@/lib/inventory");
    await commitInventoryForOrder(orderId);
  } catch (err) {
    console.warn("[checkout] inventory commit failed", err);
  }

  const paid = await orders.getById(orderId);
  if (paid) {
    try {
      const { notifyOrderConfirmed } = await import("@/lib/email/notifications");
      await notifyOrderConfirmed(paid);
    } catch (err) {
      console.warn("[checkout] email failed", err);
    }
    if ((paid.loyaltyPointsRedeemed ?? 0) > 0) {
      const { adjustLoyaltyPoints } = await import("@/lib/loyalty/store");
      await adjustLoyaltyPoints(
        paid.email,
        -paid.loyaltyPointsRedeemed!,
        `Redeemed on order ${paid.id}`
      );
    }
    await earnLoyaltyPoints(paid.email, paid.totalCents, paid.id);
    await attributeAffiliateConversion(paid.totalCents);
  }

  revalidatePath("/cart");
  revalidatePath("/account");
  revalidatePath("/account/orders");
  revalidatePath("/account/loyalty");
  revalidatePath("/account/affiliate");
  revalidatePath("/", "layout");
  redirect(`/checkout/confirmation/${orderId}`);
}

export async function setLoyaltyRedeemPointsAction(
  _prev: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const points = Number(formData.get("points") ?? 0);
  const { setRequestedRedeemPoints } = await import("@/lib/loyalty/session-redeem");
  await setRequestedRedeemPoints(Number.isFinite(points) ? points : 0);
  revalidatePath("/checkout");
  revalidatePath("/cart");
  return {};
}

export type ReportPaymentState = {
  error?: string;
};

/** Customer reports they sent Bitcoin — notify ops; order stays pending until verified. */
export async function reportBitcoinPayment(
  orderId: string,
  _prev: ReportPaymentState,
  _formData: FormData
): Promise<ReportPaymentState> {
  const orders = getOrderRepository();
  const order = await orders.getById(orderId);
  if (!order) return { error: "Order not found." };
  if (order.paymentMethod !== "paybis_btc") {
    return { error: "This order is not a Bitcoin payment." };
  }
  if (order.status === "payment_confirmed") {
    redirect(`/checkout/confirmation/${order.id}`);
  }

  try {
    const { getAdminEmail, sendEmailPayload } = await import("@/lib/email/resend");
    const { adminOrderNotification } = await import("@/lib/email/templates");
    const payload = adminOrderNotification(order);
    await sendEmailPayload({
      ...payload,
      to: getAdminEmail(),
      subject: `[DIME] Bitcoin payment reported — ${order.id}`,
    });
  } catch (err) {
    console.warn("[checkout] bitcoin report email failed", err);
  }

  await persistCartLines([]);
  await setAppliedCouponCode(null);
  const { setRequestedRedeemPoints } = await import("@/lib/loyalty/session-redeem");
  await setRequestedRedeemPoints(0);

  revalidatePath("/cart");
  revalidatePath(`/checkout/bitcoin/${orderId}`);
  revalidatePath(`/checkout/confirmation/${orderId}`);
  redirect(`/checkout/confirmation/${orderId}?btc_reported=1`);
}
