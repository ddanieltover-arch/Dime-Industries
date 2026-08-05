// app/(commerce)/wholesale-actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { isLaunchJurisdiction } from "@/lib/compliance/jurisdictions";
import { isWholesaleEnabled } from "@/lib/admin/site-settings-store";
import {
  checkoutFormSchema,
  computePricing,
  getOrderRepository,
  type CheckoutAddress,
} from "@/lib/checkout";
import { getPaymentProvider } from "@/lib/payments";
import {
  WHOLESALE_DEFAULT_MOQ,
  WHOLESALE_MIN_ORDER_CENTS,
  applyWholesaleAccount,
  clearWholesaleCart,
  getWholesaleCartSnapshot,
  getWholesaleOverrides,
  persistWholesaleCart,
  requireWholesaleBuyer,
  resolveWholesaleVariantPrice,
  reviewWholesaleAccount,
  setWholesaleOverride,
  termsLabel,
  type PaymentTerms,
} from "@/lib/wholesale";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { createCatalogLookup } from "@/lib/cart/catalog-lookup";
import { addToCart, hydrateCart, removeFromCart, updateCartQuantity } from "@/lib/cart/logic";
import { WHOLESALE_MAX_QTY_PER_LINE } from "@/lib/wholesale/types";
import { applyWholesalePricing } from "@/lib/wholesale/pricing";

export type WholesaleActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function appBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const applySchema = z.object({
  email: z.string().email(),
  businessName: z.string().min(2).max(120),
  licenseNumber: z.string().max(80).optional(),
  resaleCertUrl: z.string().url().optional().or(z.literal("")),
  preferredTerms: z.enum(["net30", "net60", "upfront"]).default("net30"),
});

export async function submitWholesaleApplication(
  _prev: WholesaleActionState,
  formData: FormData
): Promise<WholesaleActionState> {
  if (!(await isWholesaleEnabled())) {
    return { error: "Wholesale applications are temporarily closed." };
  }

  const parsed = applySchema.safeParse({
    email: String(formData.get("email") ?? ""),
    businessName: String(formData.get("businessName") ?? ""),
    licenseNumber: String(formData.get("licenseNumber") ?? "") || undefined,
    resaleCertUrl: String(formData.get("resaleCertUrl") ?? "") || undefined,
    preferredTerms: String(formData.get("preferredTerms") ?? "net30"),
  });
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { account, created } = await applyWholesaleAccount({
    email: parsed.data.email,
    businessName: parsed.data.businessName,
    licenseNumber: parsed.data.licenseNumber,
    resaleCertUrl: parsed.data.resaleCertUrl || undefined,
    preferredTerms: parsed.data.preferredTerms,
  });

  revalidatePath("/wholesale");
  revalidatePath("/admin/wholesale");

  if (account.status === "approved") {
    return { success: "Your account is already approved. Open the wholesale shop." };
  }
  if (!created && account.status === "pending") {
    return { success: "Application already pending review." };
  }

  try {
    const { notifyWholesaleApplication } = await import("@/lib/email/notifications");
    await notifyWholesaleApplication({
      email: parsed.data.email,
      businessName: parsed.data.businessName,
      licenseNumber: parsed.data.licenseNumber,
      resaleCertUrl: parsed.data.resaleCertUrl || undefined,
      preferredTerms: parsed.data.preferredTerms,
    });
  } catch (err) {
    console.warn("[wholesale] application email failed", err);
  }

  return { success: "Application submitted. Check your email — an admin will review your account." };
}

export async function addWholesaleCartItem(
  _prev: WholesaleActionState,
  formData: FormData
): Promise<WholesaleActionState> {
  if (!(await isWholesaleEnabled())) {
    return { error: "Wholesale ordering is temporarily closed." };
  }
  try {
    await requireWholesaleBuyer();
  } catch {
    return { error: "Wholesale access required." };
  }

  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? WHOLESALE_DEFAULT_MOQ);
  const [catalog, overrides, cart] = await Promise.all([
    loadEffectiveCatalog(),
    getWholesaleOverrides(),
    getWholesaleCartSnapshot(),
  ]);
  const priced = applyWholesalePricing(catalog, overrides);
  const found = createCatalogLookup(priced).findVariant(variantId);
  if (!found) return { error: "Variant not found." };

  const meta = resolveWholesaleVariantPrice(
    catalog.flatMap((p) => p.variants).find((v) => v.id === variantId) ?? found.variant,
    overrides
  );
  if (quantity < meta.minQuantity) {
    return { error: `Minimum order quantity is ${meta.minQuantity}.` };
  }

  const next = addToCart(cart.lines, found.product, found.variant, quantity);
  // Re-clamp with wholesale absolute max
  const remapped = hydrateCart(
    next.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    {
      findVariant(id) {
        const hit = createCatalogLookup(priced).findVariant(id);
        if (!hit) return null;
        return {
          product: hit.product,
          variant: {
            ...hit.variant,
            quantityOnHand: Math.min(hit.variant.quantityOnHand, WHOLESALE_MAX_QTY_PER_LINE),
          },
        };
      },
    },
    { absoluteMaxQty: WHOLESALE_MAX_QTY_PER_LINE, maxLines: 40 }
  );
  await persistWholesaleCart(remapped);
  revalidatePath("/wholesale/shop");
  revalidatePath("/wholesale/checkout");
  return { success: "Added to wholesale cart." };
}

export async function updateWholesaleCartItem(
  _prev: WholesaleActionState,
  formData: FormData
): Promise<WholesaleActionState> {
  try {
    await requireWholesaleBuyer();
  } catch {
    return { error: "Wholesale access required." };
  }
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const cart = await getWholesaleCartSnapshot();
  const moq = cart.moqByVariant[variantId] ?? WHOLESALE_DEFAULT_MOQ;
  if (quantity > 0 && quantity < moq) {
    return { error: `Minimum order quantity is ${moq}.` };
  }
  const [catalog, overrides] = await Promise.all([
    loadEffectiveCatalog(),
    getWholesaleOverrides(),
  ]);
  const priced = applyWholesalePricing(catalog, overrides);
  const lookup = {
    findVariant(id: string) {
      const hit = createCatalogLookup(priced).findVariant(id);
      if (!hit) return null;
      return {
        product: hit.product,
        variant: {
          ...hit.variant,
          quantityOnHand: Math.min(hit.variant.quantityOnHand, WHOLESALE_MAX_QTY_PER_LINE),
        },
      };
    },
  };
  const next =
    quantity <= 0
      ? removeFromCart(cart.lines, variantId)
      : updateCartQuantity(cart.lines, variantId, quantity, lookup);
  await persistWholesaleCart(next);
  revalidatePath("/wholesale/shop");
  revalidatePath("/wholesale/checkout");
  return { success: "Cart updated." };
}

export async function startWholesaleCheckout(
  _prev: WholesaleActionState,
  formData: FormData
): Promise<WholesaleActionState> {
  if (!(await isWholesaleEnabled())) {
    return { error: "Wholesale ordering is temporarily closed." };
  }
  let buyer;
  try {
    buyer = await requireWholesaleBuyer();
  } catch {
    return { error: "Wholesale access required. Apply and wait for approval." };
  }

  const gate = await getAgeGateState();
  if (!gate.ageVerified) {
    return { error: "Age verification is required." };
  }

  const paymentTerms = String(formData.get("paymentTerms") ?? buyer.account.defaultPaymentTerms) as PaymentTerms;
  if (!["net30", "net60", "upfront"].includes(paymentTerms)) {
    return { error: "Select valid payment terms." };
  }

  const raw = {
    email: String(formData.get("email") ?? buyer.email),
    phone: String(formData.get("phone") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "US"),
    confirmAge: formData.get("confirmAge") === "on" ? "on" : "",
  };
  const parsed = checkoutFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  // Catalog / tax / inventory jurisdiction stays on the age-gate market.
  // Shipping address may be worldwide and is not limited to CA/MA.
  const jurisdiction =
    gate.jurisdiction && isLaunchJurisdiction(gate.jurisdiction) ? gate.jurisdiction : "CA";

  const cart = await getWholesaleCartSnapshot();
  if (cart.lines.length === 0) return { error: "Wholesale cart is empty." };

  for (const line of cart.lines) {
    const moq = cart.moqByVariant[line.variantId] ?? WHOLESALE_DEFAULT_MOQ;
    if (line.quantity < moq) {
      return { error: `${line.productName} requires MOQ of ${moq}.` };
    }
  }

  if (cart.subtotalCents < WHOLESALE_MIN_ORDER_CENTS) {
    return {
      error: `Minimum wholesale order is $${(WHOLESALE_MIN_ORDER_CENTS / 100).toFixed(0)}.`,
    };
  }

  const address: CheckoutAddress = {
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || undefined,
    city: parsed.data.city,
    state: parsed.data.state,
    postalCode: parsed.data.postalCode,
    country: parsed.data.country,
  };

  const pricing = computePricing(cart.lines, {
    state: parsed.data.state,
    country: parsed.data.country,
  }, null);
  const orders = getOrderRepository();
  const isNet = paymentTerms === "net30" || paymentTerms === "net60";

  const order = await orders.create({
    email: parsed.data.email,
    address,
    jurisdiction,
    lines: cart.lines,
    pricing,
    channel: "wholesale",
    paymentTerms,
    paymentMethod: isNet ? "net_terms" : "paybis_btc",
    wholesaleBusinessName: buyer.account.businessName,
    acceptOnTerms: isNet,
  });

  const { reserveInventoryForOrder, releaseInventoryForOrder, commitInventoryForOrder } =
    await import("@/lib/inventory");
  const reserved = await reserveInventoryForOrder(
    order.id,
    cart.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }))
  );
  if (!reserved.ok) {
    const { changeOrderStatus } = await import("@/lib/checkout/status-change");
    await changeOrderStatus(order.id, "cancelled", { notify: false });
    await releaseInventoryForOrder(order.id);
    return { error: reserved.error };
  }

  if (isNet) {
    await commitInventoryForOrder(order.id);
    await clearWholesaleCart();
    try {
      const { notifyOrderConfirmed } = await import("@/lib/email/notifications");
      await notifyOrderConfirmed(order);
    } catch (err) {
      console.warn("[wholesale] email failed", err);
    }
    revalidatePath("/wholesale/shop");
    revalidatePath("/account/orders");
    redirect(`/checkout/confirmation/${order.id}?terms=${paymentTerms}`);
  }

  const provider = getPaymentProvider();
  const base = appBaseUrl();
  const session = await provider.createSession({
    orderId: order.id,
    amountCents: order.totalCents,
    currency: "USD",
    customerEmail: order.email,
    successUrl: `${base}/checkout/confirmation/${order.id}?paid=1`,
    failureUrl: `${base}/wholesale/checkout?error=payment_failed&orderId=${order.id}`,
    metadata: { jurisdiction: order.jurisdiction, channel: "wholesale" },
  });

  await orders.update(order.id, {
    paymentRequestId: session.requestId,
    paymentMode: session.mode,
  });

  revalidatePath("/wholesale/checkout");
  redirect(session.checkoutUrl);
}

export async function adminReviewWholesale(
  _prev: WholesaleActionState,
  formData: FormData
): Promise<WholesaleActionState> {
  const { requireAdmin } = await import("@/lib/auth/session");
  await requireAdmin();

  const email = String(formData.get("email") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const terms = String(formData.get("defaultPaymentTerms") ?? "net30") as PaymentTerms;
  const notes = String(formData.get("notes") ?? "");

  if (decision !== "approved" && decision !== "rejected") {
    return { error: "Invalid decision." };
  }

  const updated = await reviewWholesaleAccount(email, decision, {
    defaultPaymentTerms: ["net30", "net60", "upfront"].includes(terms) ? terms : "net30",
    notes,
  });
  if (!updated) return { error: "Account not found." };

  revalidatePath("/admin/wholesale");
  revalidatePath("/wholesale");
  return {
    success: `${updated.email} marked ${updated.status} (${termsLabel(updated.defaultPaymentTerms)}).`,
  };
}

export async function adminSetWholesalePrice(
  _prev: WholesaleActionState,
  formData: FormData
): Promise<WholesaleActionState> {
  const { requireAdmin } = await import("@/lib/auth/session");
  await requireAdmin();

  const variantId = String(formData.get("variantId") ?? "");
  const priceCents = Math.round(Number(formData.get("priceDollars") ?? 0) * 100);
  const minQuantity = Number(formData.get("minQuantity") ?? WHOLESALE_DEFAULT_MOQ);
  if (!variantId || priceCents < 0 || minQuantity < 1) {
    return { error: "Invalid override." };
  }
  await setWholesaleOverride({ variantId, priceCents, minQuantity });
  revalidatePath("/admin/wholesale");
  revalidatePath("/wholesale/shop");
  return { success: "Wholesale price override saved." };
}

export async function addWholesaleCartItemForm(formData: FormData) {
  await addWholesaleCartItem({}, formData);
}

export async function updateWholesaleCartItemForm(formData: FormData) {
  await updateWholesaleCartItem({}, formData);
}
