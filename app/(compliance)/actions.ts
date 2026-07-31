// app/(compliance)/actions.ts
"use server";

import { cookies } from "next/headers";

export type AgeGateActionState = {
  error?: string;
  success?: boolean;
};

export async function confirmAgeGate(
  _prev: AgeGateActionState,
  formData: FormData
): Promise<AgeGateActionState> {
  const isOfAge = formData.get("isOfAge") === "yes";

  if (!isOfAge) {
    return { error: "You must be 21 or older to enter this site." };
  }

  try {
    const store = await cookies();
    const oneYear = 60 * 60 * 24 * 365;
    store.set("dime_age_verified", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: oneYear,
      path: "/",
    });
  } catch (err) {
    console.error("[age-gate] cookie write failed", err);
    return { error: "Could not save age verification. Please try again." };
  }

  return { success: true };
}
