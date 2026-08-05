// app/(account)/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  getAccountPrefs,
  saveAccountPrefs,
  type AccountAddress,
} from "@/lib/account/prefs";
import { validateProductCode } from "@/lib/account/validate-product";
import { withEffectiveCatalog } from "@/lib/catalog/effective";
import { z } from "zod";

export type AccountActionState = {
  error?: string;
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateAccountProfile(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  await requireUser();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (displayName.length > 80) return { error: "Display name is too long." };
  if (phone && (phone.length < 7 || phone.length > 20)) {
    return { error: "Enter a valid phone number." };
  }

  const prefs = await getAccountPrefs();
  await saveAccountPrefs({ ...prefs, displayName, phone });
  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { success: true, message: "Profile updated." };
}

export async function updateNotificationPrefs(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  await requireUser();
  const prefs = await getAccountPrefs();
  await saveAccountPrefs({
    ...prefs,
    notifications: {
      orderUpdates: formData.get("orderUpdates") === "on",
      marketing: formData.get("marketing") === "on",
      productAlerts: formData.get("productAlerts") === "on",
    },
  });
  revalidatePath("/account/notifications");
  return { success: true, message: "Notification preferences saved." };
}

const addressFormSchema = z.object({
  label: z.string().min(1).max(40),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional().or(z.literal("")),
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
    .refine((v) => v.length === 2, { message: "Select a shipping country" }),
  isDefault: z.boolean(),
});

export async function addAccountAddress(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  await requireUser();
  const parsed = addressFormSchema.safeParse({
    label: formData.get("label"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") ?? "US",
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const prefs = await getAccountPrefs();
  const address: AccountAddress = {
    id: `addr_${crypto.randomUUID().slice(0, 8)}`,
    label: parsed.data.label,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || undefined,
    city: parsed.data.city,
    state: parsed.data.state,
    postalCode: parsed.data.postalCode,
    country: parsed.data.country,
    isDefault: parsed.data.isDefault || prefs.addresses.length === 0,
  };

  let addresses = [...prefs.addresses];
  if (address.isDefault) {
    addresses = addresses.map((a) => ({ ...a, isDefault: false }));
  }
  addresses.push(address);
  await saveAccountPrefs({ ...prefs, addresses });
  revalidatePath("/account/addresses");
  return { success: true, message: "Address saved." };
}

export async function removeAccountAddress(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  await requireUser();
  const id = String(formData.get("addressId") ?? "");
  const prefs = await getAccountPrefs();
  const addresses = prefs.addresses.filter((a) => a.id !== id);
  if (addresses.length && !addresses.some((a) => a.isDefault)) {
    addresses[0]!.isDefault = true;
  }
  await saveAccountPrefs({ ...prefs, addresses });
  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return { success: true, message: "Address removed." };
}

export async function setDefaultAccountAddress(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  await requireUser();
  const id = String(formData.get("addressId") ?? "");
  const prefs = await getAccountPrefs();
  if (!prefs.addresses.some((a) => a.id === id)) {
    return { error: "Address not found." };
  }
  const addresses = prefs.addresses.map((a) => ({ ...a, isDefault: a.id === id }));
  await saveAccountPrefs({ ...prefs, addresses });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true, message: "Default address updated." };
}

export async function submitProductValidation(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  await requireUser();
  const code = String(formData.get("code") ?? "");
  const result = await withEffectiveCatalog(() => validateProductCode(code));
  if (!result.ok) return { error: result.message };
  revalidatePath("/account/validate");
  return {
    success: true,
    message: `${result.message} (${result.productName} · ${result.sku})`,
  };
}
