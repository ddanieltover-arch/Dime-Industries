// lib/account/prefs.ts
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { isShippingCountry } from "@/lib/checkout/countries";

export const ACCOUNT_PREFS_COOKIE = "dime_account_prefs";

const addressSchema = z.object({
  id: z.string(),
  label: z.string().max(40),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z
    .string()
    .trim()
    .min(2)
    .max(16)
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{1,15}$/),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .refine(isShippingCountry, { message: "Select a shipping country" })
    .default("US"),
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

function normalizePrefs(raw: unknown): AccountPrefs {
  if (!raw || typeof raw !== "object") {
    return { ...defaults, notifications: { ...defaults.notifications }, addresses: [] };
  }
  const candidate = raw as AccountPrefs;
  const addresses = Array.isArray(candidate.addresses)
    ? candidate.addresses
        .map((a) => {
          const parsed = addressSchema.safeParse({
            ...a,
            country: a.country ?? "US",
          });
          return parsed.success ? parsed.data : null;
        })
        .filter((a): a is AccountAddress => Boolean(a))
    : [];
  const parsed = prefsSchema.safeParse({ ...candidate, addresses });
  return parsed.success
    ? parsed.data
    : { ...defaults, notifications: { ...defaults.notifications }, addresses: [] };
}

export async function getAccountPrefs(): Promise<AccountPrefs> {
  const store = await cookies();
  const raw = store.get(ACCOUNT_PREFS_COOKIE)?.value;
  if (!raw) return { ...defaults, notifications: { ...defaults.notifications }, addresses: [] };
  try {
    return normalizePrefs(JSON.parse(decodeURIComponent(raw)));
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
