// app/(compliance)/actions.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLaunchJurisdiction } from "@/lib/compliance/age-gate";

export type AgeGateActionState = {
  error?: string;
  needsJurisdiction?: boolean;
  notAvailable?: boolean;
};

export async function confirmAgeGate(
  _prev: AgeGateActionState,
  formData: FormData
): Promise<AgeGateActionState> {
  const isOfAge = formData.get("isOfAge") === "yes";
  const jurisdictionInput = String(formData.get("jurisdiction") ?? "").toUpperCase();

  if (!isOfAge) {
    return { error: "You must be 21 or older to enter this site." };
  }

  if (!jurisdictionInput) {
    return { needsJurisdiction: true };
  }

  if (!isLaunchJurisdiction(jurisdictionInput)) {
    // Real, honest outcome — not a silent redirect. This is a legal control,
    // not a UX inconvenience to route around.
    return { notAvailable: true };
  }

  const store = await cookies();
  const oneYear = 60 * 60 * 24 * 365;
  store.set("dime_age_verified", "1", { httpOnly: true, secure: true, sameSite: "lax", maxAge: oneYear, path: "/" });
  store.set("dime_jurisdiction", jurisdictionInput, { httpOnly: true, secure: true, sameSite: "lax", maxAge: oneYear, path: "/" });

  revalidatePath("/");
  return {};
}
