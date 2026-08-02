// lib/email/resend.ts
// Transactional email via Resend. When RESEND_API_KEY is unset, logs and
// returns a dry-run result so checkout still completes in local/dev.

import "server-only";
import { BRAND_EMAIL, BRAND_FROM } from "@/lib/brand/email";
import type { EmailPayload } from "./templates";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type SendEmailResult = {
  ok: boolean;
  mode: "live" | "dry-run";
  id?: string;
  error?: string;
};

export function getAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.ORDER_NOTIFY_TO?.trim() ||
    BRAND_EMAIL
  );
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM?.trim() || BRAND_FROM;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getFromAddress();
  const to = Array.isArray(input.to) ? input.to : [input.to];

  if (!apiKey) {
    console.info("[email.dry-run]", {
      to,
      subject: input.subject,
      replyTo: input.replyTo,
    });
    return { ok: true, mode: "dry-run", id: `dry_${Date.now()}` };
  }

  const body: Record<string, unknown> = {
    from,
    to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  };
  if (input.replyTo) body.reply_to = input.replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[email.resend]", res.status, errBody.slice(0, 300));
    return { ok: false, mode: "live", error: errBody.slice(0, 200) };
  }

  const data = (await res.json()) as { id?: string };
  return { ok: true, mode: "live", id: data.id };
}

export async function sendEmailPayload(payload: EmailPayload): Promise<SendEmailResult> {
  return sendEmail({
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
  });
}

/** Re-export for existing imports */
export { orderConfirmationEmail } from "./templates";
export type { OrderEmailInput } from "./templates";
