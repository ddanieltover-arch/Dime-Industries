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

async function requireAgeVerified(): Promise<string | null> {
  const gate = await getAgeGateState();
  if (!gate.ageVerified) return "Age verification required before adding to cart.";
  return null;
}

function revalidateCommerce() {
  revalidatePath("/cart");
  revalidatePath("/wishlist");
  revalidatePath("/", "layout");
}

export async function addItemToCart(
  _prev: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const ageError = await requireAgeVerified();
  if (ageError) return { error: ageError };

  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const catalog = await loadEffectiveCatalog();
  const found = findVariantAcrossCatalog(variantId, catalog);
  if (!found) return { error: "Product variant not found." };
  if (found.variant.quantityOnHand <= 0) return { error: "This item is out of stock." };

  const gate = await getAgeGateState();
  if (
    gate.jurisdiction &&
    !found.product.allowedJurisdictions.includes(gate.jurisdiction)
  ) {
    return { error: "This product is not available in your jurisdiction." };
  }

  const lookup = createCatalogLookup(catalog);
  const current = hydrateCart(await readCartInputs(), lookup);
  const next = addToCart(current, found.product, found.variant, quantity);
  const snap = await persistCartLines(next);
  revalidateCommerce();
  return { ok: true, itemCount: snap.itemCount };
}

export async function updateCartItem(
  _prev: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const ageError = await requireAgeVerified();
  if (ageError) return { error: ageError };

  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  const catalog = await loadEffectiveCatalog();
  const lookup = createCatalogLookup(catalog);
  const current = hydrateCart(await readCartInputs(), lookup);
  const next = updateCartQuantity(current, variantId, quantity, lookup);
  const snap = await persistCartLines(next);
  revalidateCommerce();
  return { ok: true, itemCount: snap.itemCount };
}

export async function removeCartItem(
  _prev: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const variantId = String(formData.get("variantId") ?? "");
  const catalog = await loadEffectiveCatalog();
  const lookup = createCatalogLookup(catalog);
  const current = hydrateCart(await readCartInputs(), lookup);
  const snap = await persistCartLines(removeFromCart(current, variantId));
  revalidateCommerce();
  return { ok: true, itemCount: snap.itemCount };
}

export async function clearCart(): Promise<CommerceActionState> {
  await persistCartLines([]);
  revalidateCommerce();
  return { ok: true, itemCount: 0 };
}

export async function getCartCount(): Promise<number> {
  const snap = await getCartSnapshot();
  return snap.itemCount;
}
