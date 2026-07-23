// lib/wholesale/cart.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { createCatalogLookup } from "@/lib/cart/catalog-lookup";
import { cartSnapshot, hydrateCart, serializeCartInputs, type CartLookup } from "@/lib/cart/logic";
import type { CartLine, CartLineInput, CartSnapshot } from "@/lib/cart/types";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { applyWholesalePricing, resolveWholesaleVariantPrice } from "./pricing";
import { getWholesaleOverrides } from "./store";
import { WHOLESALE_CART_COOKIE, WHOLESALE_MAX_QTY_PER_LINE } from "./types";

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1).max(80),
        quantity: z.number().int().min(1).max(WHOLESALE_MAX_QTY_PER_LINE),
      })
    )
    .max(40),
});

async function readInputs(): Promise<CartLineInput[]> {
  const store = await cookies();
  const raw = store.get(WHOLESALE_CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = cartSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data.items : [];
  } catch {
    return [];
  }
}

async function writeInputs(items: CartLineInput[]): Promise<void> {
  const store = await cookies();
  store.set(WHOLESALE_CART_COOKIE, encodeURIComponent(JSON.stringify({ items })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function wholesaleLookup(): Promise<CartLookup> {
  const [catalog, overrides] = await Promise.all([
    loadEffectiveCatalog(),
    getWholesaleOverrides(),
  ]);
  const priced = applyWholesalePricing(catalog, overrides);
  const base = createCatalogLookup(priced);
  return {
    findVariant(variantId: string) {
      const found = base.findVariant(variantId);
      if (!found) return null;
      const meta = resolveWholesaleVariantPrice(
        catalog.flatMap((p) => p.variants).find((v) => v.id === variantId) ?? found.variant,
        overrides
      );
      return {
        product: found.product,
        variant: {
          ...found.variant,
          retailPriceCents: meta.wholesalePriceCents,
          // Cap cart qty; MOQ checked separately
          quantityOnHand: Math.min(found.variant.quantityOnHand, WHOLESALE_MAX_QTY_PER_LINE),
        },
      };
    },
  };
}

function enforceMoq(lines: CartLine[], overrides: Awaited<ReturnType<typeof getWholesaleOverrides>>) {
  // Re-tag maxQuantity to MOQ floor awareness via unit helpers in actions
  return lines.map((line) => {
    const ov = overrides[line.variantId];
    const moq = ov?.minQuantity ?? 5;
    return {
      ...line,
      maxQuantity: Math.max(moq, line.maxQuantity),
      // stash moq in a side channel? use maxQuantity as stock; check moq in actions
    };
  });
}

export async function getWholesaleCartSnapshot(): Promise<CartSnapshot & { moqByVariant: Record<string, number> }> {
  const [inputs, overrides] = await Promise.all([readInputs(), getWholesaleOverrides()]);
  const lookup = await wholesaleLookup();
  const lines = hydrateCart(inputs, lookup, {
    absoluteMaxQty: WHOLESALE_MAX_QTY_PER_LINE,
    maxLines: 40,
  });
  const moqByVariant: Record<string, number> = {};
  for (const line of lines) {
    moqByVariant[line.variantId] = overrides[line.variantId]?.minQuantity ?? 5;
  }
  const adjusted = enforceMoq(lines, overrides);
  return { ...cartSnapshot(adjusted), moqByVariant };
}

export async function persistWholesaleCart(lines: CartLine[]): Promise<CartSnapshot> {
  await writeInputs(serializeCartInputs(lines));
  return cartSnapshot(lines);
}

export async function clearWholesaleCart(): Promise<void> {
  await writeInputs([]);
}

export { readInputs as readWholesaleCartInputs };
