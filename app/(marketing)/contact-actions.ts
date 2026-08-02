// app/(marketing)/contact-actions.ts
"use server";

import { z } from "zod";
import { BRAND_EMAIL } from "@/lib/brand/email";

export type ContactActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().email("Enter a valid email."),
  subject: z.string().trim().min(3, "Enter a subject.").max(160),
  message: z.string().trim().min(10, "Message is too short.").max(5000),
  orderId: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function submitContactForm(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    orderId: String(formData.get("orderId") ?? ""),
  });

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { notifyContactForm } = await import("@/lib/email/notifications");
    const result = await notifyContactForm({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      orderId: parsed.data.orderId || undefined,
    });
    if (!result.admin.ok && !result.customer.ok) {
      return { error: `Could not send your message. Please email ${BRAND_EMAIL}.` };
    }
  } catch (err) {
    console.warn("[contact] email failed", err);
    return { error: `Could not send your message. Please email ${BRAND_EMAIL}.` };
  }

  return { success: true };
}
