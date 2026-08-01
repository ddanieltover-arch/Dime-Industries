// app/(consent)/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { saveCookieConsent } from "@/lib/consent/cookie";
import {
  acceptAllConsent,
  rejectOptionalConsent,
  saveCustomConsent,
} from "@/lib/consent/logic";

export type ConsentActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

function revalidateConsent() {
  revalidatePath("/", "layout");
  revalidatePath("/account/notifications");
  revalidatePath("/cookies");
}

export async function acceptAllCookiesAction(
  _prev: ConsentActionState,
  _formData: FormData
): Promise<ConsentActionState> {
  await saveCookieConsent(acceptAllConsent());
  revalidateConsent();
  return { success: true, message: "All cookies accepted." };
}

export async function rejectOptionalCookiesAction(
  _prev: ConsentActionState,
  _formData: FormData
): Promise<ConsentActionState> {
  await saveCookieConsent(rejectOptionalConsent());
  revalidateConsent();
  return { success: true, message: "Optional cookies declined." };
}

export async function saveCookiePrefsAction(
  _prev: ConsentActionState,
  formData: FormData
): Promise<ConsentActionState> {
  await saveCookieConsent(
    saveCustomConsent({
      analytics: formData.get("analytics") === "on",
      marketing: formData.get("marketing") === "on",
    })
  );
  revalidateConsent();
  return { success: true, message: "Cookie preferences saved." };
}
