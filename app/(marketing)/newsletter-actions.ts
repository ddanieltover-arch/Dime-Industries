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

  // TODO(Integrations phase): write to a real subscriber list via Resend
  // (or whatever list-management piece that phase settles on) instead of
  // this no-op. Intentionally not touching the database directly here since
  // there's no `newsletter_subscribers` table in the shipped schema yet —
  // adding one silently, outside of Database Mode, would bypass the process
  // this whole build has been following.
  await new Promise((r) => setTimeout(r, 400));

  return { success: true };
}
