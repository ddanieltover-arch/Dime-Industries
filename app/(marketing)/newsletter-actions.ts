// app/(marketing)/newsletter-actions.ts
"use server";

import { z } from "zod";

export type NewsletterActionState = {
  error?: string;
  success?: boolean;
};

const schema = z.object({ email: z.string().email() });

export async function subscribeToNewsletter(
  _prev: NewsletterActionState,
  formData: FormData
): Promise<NewsletterActionState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  try {
    const { notifyNewsletterSignup } = await import("@/lib/email/notifications");
    const result = await notifyNewsletterSignup(parsed.data.email);
    // dualSend logs failures without throwing — require customer welcome to succeed.
    if (!result.customer.ok) {
      console.warn("[newsletter] customer welcome failed", result.customer.error);
      return { error: "Could not complete signup. Please try again." };
    }
  } catch (err) {
    console.warn("[newsletter] email failed", err);
    return { error: "Could not complete signup. Please try again." };
  }

  return { success: true };
}
