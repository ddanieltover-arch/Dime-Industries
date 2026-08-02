// lib/cart/cookie.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  cartSnapshot,
  hydrateCart,
  mergeCarts,
  serializeCartInputs,
  type CartLookup,
} from "./logic";
import { createCatalogLookup } from "./catalog-lookup";
import {
  CART_COOKIE,
  type CartLine,
  type CartLineInput,
  type CartSnapshot,
} from "./types";
import { isGrowthDatabaseMode } from "@/lib/db/growth-mode";
import { cartOwnerKey, readDbCartInputs, writeDbCartInputs } from "./cart-db";

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1).max(80),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .max(30),
});

async function readCookieCartInputs(): Promise<CartLineInput[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = cartSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success) return [];
    return parsed.data.items;
  } catch {
    return [];
  }
}

async function writeCookieCartInputs(items: CartLineInput[]): Promise<void> {
  const store = await cookies();
  const payload = encodeURIComponent(JSON.stringify({ items }));
  store.set(CART_COOKIE, payload, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function currentOwnerEmail(): Promise<string | null> {
  try {
    const { getCurrentProfile } = await import("@/lib/auth/session");
    const profile = await getCurrentProfile();
    return profile?.email ?? null;
  } catch {
    return null;
  }
}

export async function readCartInputs(): Promise<CartLineInput[]> {
  // Cookie carts skip auth — getCurrentProfile() is a Supabase round-trip guests shouldn't pay for.
  if (isGrowthDatabaseMode()) {
    const email = await currentOwnerEmail();
    if (email) return readDbCartInputs(cartOwnerKey(email));
  }
  return readCookieCartInputs();
}

export async function writeCartInputs(items: CartLineInput[]): Promise<void> {
  if (isGrowthDatabaseMode()) {
    const email = await currentOwnerEmail();
    if (email) {
      await writeDbCartInputs(cartOwnerKey(email), items);
      // Keep cookie as a lightweight guest fallback mirror after logout.
      await writeCookieCartInputs(items);
      return;
    }
  }
  await writeCookieCartInputs(items);
}

export async function getCartSnapshot(lookup?: CartLookup): Promise<CartSnapshot> {
  const inputs = await readCartInputs();
  let resolved = lookup;
  if (!resolved) {
    try {
      const { loadEffectiveCatalog } = await import("@/lib/catalog/effective");
      resolved = createCatalogLookup(await loadEffectiveCatalog());
    } catch {
      resolved = createCatalogLookup();
    }
  }
  const lines = hydrateCart(inputs, resolved);
  return cartSnapshot(lines);
}

export async function persistCartLines(lines: CartLine[]): Promise<CartSnapshot> {
  await writeCartInputs(serializeCartInputs(lines));
  return cartSnapshot(lines);
}

/**
 * After login: merge guest cookie cart into the user's durable cart (DB when enabled).
 */
export async function mergeGuestCartForUser(email: string): Promise<void> {
  const guestInputs = await readCookieCartInputs();
  if (guestInputs.length === 0) {
    if (isGrowthDatabaseMode()) {
      // Ensure cookie mirrors DB for UX consistency
      const dbInputs = await readDbCartInputs(cartOwnerKey(email));
      await writeCookieCartInputs(dbInputs);
    }
    return;
  }

  const lookup = createCatalogLookup();
  const guestLines = hydrateCart(guestInputs, lookup);

  if (isGrowthDatabaseMode()) {
    const existingInputs = await readDbCartInputs(cartOwnerKey(email));
    const existingLines = hydrateCart(existingInputs, lookup);
    const merged = mergeCarts(existingLines, guestLines);
    const serialized = serializeCartInputs(merged);
    await writeDbCartInputs(cartOwnerKey(email), serialized);
    await writeCookieCartInputs(serialized);
    return;
  }

  // Cookie-only: guest cart already is the jar; nothing to merge across devices.
  await writeCookieCartInputs(guestInputs);
}
