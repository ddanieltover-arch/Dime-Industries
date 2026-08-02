// app/(commerce)/cart-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  addToCart,
  createCatalogLookup,
  getCartSnapshot,
  hydrateCart,
  persistCartLines,
  readCartInputs,
  removeFromCart,
  updateCartQuantity,
} from "@/lib/cart";
import { findVariantAcrossCatalog } from "@/lib/cart/catalog-lookup";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { getAgeGateState } from "@/lib/compliance/age-gate";

export type CommerceActionState = {
  ok?: boolean;
  error?: string;
  itemCount?: number;
};

/** Cart count is updated client-side — avoid layout revalidation (that was the slow "Adding…" stall). */
function revalidateCartViews() {
  revalidatePath("/cart");
}

export async function addItemToCart(
  _prev: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);

  const [gate, catalog, inputs] = await Promise.all([
    getAgeGateState(),
    loadEffectiveCatalog(),
    readCartInputs(),
  ]);

  if (!gate.ageVerified) {
    return { error: "Age verification required before adding to cart." };
  }

  const found = findVariantAcrossCatalog(variantId, catalog);
  if (!found) return { error: "Product variant not found." };
  if (found.variant.quantityOnHand <= 0) return { error: "This item is out of stock." };

  if (gate.jurisdiction && !found.product.allowedJurisdictions.includes(gate.jurisdiction)) {
    return { error: "This product is not available in your jurisdiction." };
  }

  const lookup = createCatalogLookup(catalog);
  const next = addToCart(hydrateCart(inputs, lookup), found.product, found.variant, quantity);
  const snap = await persistCartLines(next);
  revalidateCartViews();
  return { ok: true, itemCount: snap.itemCount };
}

export async function updateCartItem(
  _prev: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);

  const [gate, catalog, inputs] = await Promise.all([
    getAgeGateState(),
    loadEffectiveCatalog(),
    readCartInputs(),
  ]);

  if (!gate.ageVerified) {
    return { error: "Age verification required before adding to cart." };
  }

  const lookup = createCatalogLookup(catalog);
  const next = updateCartQuantity(hydrateCart(inputs, lookup), variantId, quantity, lookup);
  const snap = await persistCartLines(next);
  revalidateCartViews();
  return { ok: true, itemCount: snap.itemCount };
}

export async function removeCartItem(
  _prev: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const variantId = String(formData.get("variantId") ?? "");

  const [catalog, inputs] = await Promise.all([loadEffectiveCatalog(), readCartInputs()]);
  const lookup = createCatalogLookup(catalog);
  const snap = await persistCartLines(removeFromCart(hydrateCart(inputs, lookup), variantId));
  revalidateCartViews();
  return { ok: true, itemCount: snap.itemCount };
}

export async function clearCart(): Promise<CommerceActionState> {
  await persistCartLines([]);
  revalidateCartViews();
  return { ok: true, itemCount: 0 };
}

export async function getCartCount(): Promise<number> {
  const snap = await getCartSnapshot();
  return snap.itemCount;
}
