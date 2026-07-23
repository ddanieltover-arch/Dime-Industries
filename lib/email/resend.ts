// lib/email/resend.ts
// Transactional email via Resend. When RESEND_API_KEY is unset, logs and
// returns a dry-run result so checkout still completes in local/dev.

import "server-only";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  ok: boolean;
  mode: "live" | "dry-run";
  id?: string;
  error?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || "DIME Commerce <orders@dimeindustries.us>";

  if (!apiKey) {
    console.info("[email.dry-run]", { to: input.to, subject: input.subject });
    return { ok: true, mode: "dry-run", id: `dry_${Date.now()}` };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, mode: "live", error: body.slice(0, 200) };
  }

  const data = (await res.json()) as { id?: string };
  return { ok: true, mode: "live", id: data.id };
}

export function orderConfirmationEmail(order: {
  id: string;
  email: string;
  totalCents: number;
  lines: { productName: string; quantity: number; unitPriceCents: number }[];
}) {
  const total = (order.totalCents / 100).toFixed(2);
  const rows = order.lines
    .map(
      (l) =>
        `<tr><td>${l.productName} × ${l.quantity}</td><td>$${((l.unitPriceCents * l.quantity) / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  return {
    to: order.email,
    subject: `Order confirmed — ${order.id}`,
    html: `
      <h1>Thanks for your order</h1>
      <p>Order <strong>${order.id}</strong> is confirmed.</p>
      <table>${rows}</table>
      <p><strong>Total: $${total}</strong></p>
      <p>We’ll notify you when it ships.</p>
    `,
    text: `Order ${order.id} confirmed. Total $${total}.`,
  };
}
