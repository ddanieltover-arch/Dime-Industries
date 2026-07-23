// lib/account/prefs.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";

export const ACCOUNT_PREFS_COOKIE = "dime_account_prefs";

const addressSchema = z.object({
  id: z.string(),
  label: z.string().max(40),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2).max(80),
  state: z.enum(["CA", "MA"]),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  isDefault: z.boolean(),
});

const prefsSchema = z.object({
  displayName: z.string().max(80).optional(),
  phone: z.string().max(20).optional(),
  notifications: z.object({
    orderUpdates: z.boolean(),
    marketing: z.boolean(),
    productAlerts: z.boolean(),
  }),
  addresses: z.array(addressSchema).max(8),
});

export type AccountAddress = z.infer<typeof addressSchema>;
export type AccountPrefs = z.infer<typeof prefsSchema>;

const defaults: AccountPrefs = {
  displayName: "",
  phone: "",
  notifications: {
    orderUpdates: true,
    marketing: false,
    productAlerts: true,
  },
  addresses: [],
};

export async function getAccountPrefs(): Promise<AccountPrefs> {
  const store = await cookies();
  const raw = store.get(ACCOUNT_PREFS_COOKIE)?.value;
  if (!raw) return { ...defaults, notifications: { ...defaults.notifications }, addresses: [] };
  try {
    const parsed = prefsSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data : { ...defaults, notifications: { ...defaults.notifications }, addresses: [] };
  } catch {
    return { ...defaults, notifications: { ...defaults.notifications }, addresses: [] };
  }
}

export async function saveAccountPrefs(prefs: AccountPrefs): Promise<void> {
  const store = await cookies();
  store.set(ACCOUNT_PREFS_COOKIE, encodeURIComponent(JSON.stringify(prefs)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}
