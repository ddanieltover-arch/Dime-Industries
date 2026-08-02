// lib/email/templates.ts
// Beautiful transactional email payloads for customer + admin recipients.

import "server-only";
import { BRAND_EMAIL } from "@/lib/brand/email";
import {
  BRAND,
  ctaButton,
  detailTable,
  emailLayout,
  escapeHtml,
  formatUsd,
  mutedNote,
  paragraph,
  siteUrl,
} from "./layout";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type OrderEmailLine = {
  productName: string;
  quantity: number;
  unitPriceCents: number;
};

export type OrderEmailInput = {
  id: string;
  email: string;
  totalCents: number;
  subtotalCents?: number;
  taxCents?: number;
  shippingCents?: number;
  discountCents?: number;
  lines: OrderEmailLine[];
  channel?: "retail" | "wholesale";
  paymentTerms?: string | null;
  paymentMethod?: string | null;
  wholesaleBusinessName?: string | null;
  address?: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  } | null;
};

function orderLinesTable(lines: OrderEmailLine[]): string {
  const rows = lines
    .map((line) => {
      const lineTotal = formatUsd(line.unitPriceCents * line.quantity);
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.ink};">
          <strong style="display:block;margin-bottom:2px;">${escapeHtml(line.productName)}</strong>
          <span style="font-size:12px;color:${BRAND.muted};">Qty ${line.quantity} · ${formatUsd(line.unitPriceCents)} each</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BRAND.ink};text-align:right;white-space:nowrap;">${lineTotal}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 16px;">${rows}</table>`;
}

function addressBlock(order: OrderEmailInput): string {
  const a = order.address;
  if (!a?.fullName && !a?.line1) return "—";
  const parts = [
    a.fullName,
    a.line1,
    a.line2,
    [a.city, a.state, a.postalCode].filter(Boolean).join(", "),
  ].filter(Boolean);
  return escapeHtml(parts.join(" · "));
}

function channelLabel(order: OrderEmailInput): string {
  return order.channel === "wholesale" ? "Wholesale" : "Retail";
}

/** Customer: order confirmed */
export function customerOrderConfirmation(order: OrderEmailInput): EmailPayload {
  const total = formatUsd(order.totalCents);
  const isWholesale = order.channel === "wholesale";
  const terms =
    order.paymentTerms === "net30"
      ? "NET-30"
      : order.paymentTerms === "net60"
        ? "NET-60"
        : order.paymentMethod === "paybis_btc"
          ? "Bitcoin"
          : order.paymentMethod ?? "Paid";

  const details = detailTable([
    { label: "Order", value: escapeHtml(order.id) },
    { label: "Channel", value: channelLabel(order) },
    { label: "Payment", value: escapeHtml(terms) },
    { label: "Ship to", value: addressBlock(order) },
  ]);

  const totals: string[] = [];
  if (typeof order.subtotalCents === "number") {
    totals.push(`Subtotal: ${formatUsd(order.subtotalCents)}`);
  }
  if ((order.discountCents ?? 0) > 0) {
    totals.push(`Discount: −${formatUsd(order.discountCents!)}`);
  }
  if (typeof order.shippingCents === "number") {
    totals.push(`Shipping: ${formatUsd(order.shippingCents)}`);
  }
  if (typeof order.taxCents === "number") {
    totals.push(`Tax: ${formatUsd(order.taxCents)}`);
  }

  const bodyHtml = [
    paragraph(
      isWholesale
        ? `Thanks for your wholesale order${order.wholesaleBusinessName ? ` for <strong>${escapeHtml(order.wholesaleBusinessName)}</strong>` : ""}. We’ve received it and will keep you posted on fulfillment.`
        : "Thank you for shopping DIME. Your order is confirmed and we’re preparing it carefully."
    ),
    details,
    orderLinesTable(order.lines),
    totals.length
      ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted};">${totals.join(" · ")}</p>`
      : "",
    `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:${BRAND.ink};">Total ${total}</p>`,
    ctaButton("View order status", siteUrl(`/checkout/confirmation/${order.id}`)),
    mutedNote("We’ll email you again when your order ships. Keep this message for your records."),
  ].join("");

  return {
    to: order.email,
    subject: `Order confirmed — ${order.id}`,
    html: emailLayout({
      preheader: `Your DIME order ${order.id} is confirmed. Total ${total}.`,
      eyebrow: "Order confirmation",
      title: "Thanks for your order",
      bodyHtml,
    }),
    text: [
      `Order ${order.id} confirmed.`,
      `Total: ${total}`,
      ...order.lines.map((l) => `- ${l.productName} × ${l.quantity}`),
      `View: ${siteUrl(`/checkout/confirmation/${order.id}`)}`,
    ].join("\n"),
  };
}

/** Admin: new paid / accepted order */
export function adminOrderNotification(order: OrderEmailInput): EmailPayload {
  const total = formatUsd(order.totalCents);
  const bodyHtml = [
    paragraph(
      `A new <strong>${channelLabel(order).toLowerCase()}</strong> order needs attention.`
    ),
    detailTable([
      { label: "Order", value: escapeHtml(order.id) },
      { label: "Customer", value: escapeHtml(order.email) },
      ...(order.wholesaleBusinessName
        ? [{ label: "Business", value: escapeHtml(order.wholesaleBusinessName) }]
        : []),
      { label: "Payment", value: escapeHtml(order.paymentTerms || order.paymentMethod || "—") },
      { label: "Ship to", value: addressBlock(order) },
      { label: "Total", value: `<strong>${total}</strong>` },
    ]),
    orderLinesTable(order.lines),
    ctaButton("Open admin", siteUrl("/admin")),
  ].join("");

  return {
    to: "", // filled by notifications layer
    subject: `[DIME] New ${channelLabel(order).toLowerCase()} order ${order.id} — ${total}`,
    html: emailLayout({
      preheader: `New order ${order.id} from ${order.email} · ${total}`,
      eyebrow: "Admin alert",
      title: "New order received",
      bodyHtml,
      footerNote: "Internal notification — do not forward to customers.",
    }),
    text: [
      `New order ${order.id}`,
      `Customer: ${order.email}`,
      `Total: ${total}`,
      ...order.lines.map((l) => `- ${l.productName} × ${l.quantity}`),
    ].join("\n"),
    replyTo: order.email,
  };
}

export type WholesaleApplicationEmailInput = {
  email: string;
  businessName: string;
  licenseNumber?: string;
  resaleCertUrl?: string;
  preferredTerms: string;
};

export function customerWholesaleApplicationReceived(
  input: WholesaleApplicationEmailInput
): EmailPayload {
  const terms =
    input.preferredTerms === "net30"
      ? "NET-30"
      : input.preferredTerms === "net60"
        ? "NET-60"
        : "Pay upfront (Bitcoin)";

  const bodyHtml = [
    paragraph(
      `We received your wholesale application for <strong>${escapeHtml(input.businessName)}</strong>. Our team will review your account and email you when a decision is ready.`
    ),
    detailTable([
      { label: "Business", value: escapeHtml(input.businessName) },
      { label: "Email", value: escapeHtml(input.email) },
      { label: "Preferred terms", value: escapeHtml(terms) },
      ...(input.licenseNumber
        ? [{ label: "License", value: escapeHtml(input.licenseNumber) }]
        : []),
    ]),
    mutedNote("Typical review time is 1–3 business days. No further action is needed right now."),
  ].join("");

  return {
    to: input.email,
    subject: "Wholesale application received — DIME Industries",
    html: emailLayout({
      preheader: "Your DIME wholesale application is in review.",
      eyebrow: "Wholesale",
      title: "Application received",
      bodyHtml,
    }),
    text: `Wholesale application received for ${input.businessName}. Preferred terms: ${terms}. We'll email you after review.`,
  };
}

export function adminWholesaleApplicationNotification(
  input: WholesaleApplicationEmailInput
): EmailPayload {
  const bodyHtml = [
    paragraph("A new wholesale account application is waiting for review."),
    detailTable([
      { label: "Business", value: escapeHtml(input.businessName) },
      { label: "Email", value: escapeHtml(input.email) },
      { label: "Preferred terms", value: escapeHtml(input.preferredTerms) },
      {
        label: "License",
        value: escapeHtml(input.licenseNumber || "—"),
      },
      {
        label: "Resale cert",
        value: input.resaleCertUrl
          ? `<a href="${escapeHtml(input.resaleCertUrl)}" style="color:${BRAND.ink};">${escapeHtml(input.resaleCertUrl)}</a>`
          : "—",
      },
    ]),
    ctaButton("Review wholesale", siteUrl("/admin/wholesale")),
  ].join("");

  return {
    to: "",
    subject: `[DIME] Wholesale application — ${input.businessName}`,
    html: emailLayout({
      preheader: `Wholesale apply: ${input.businessName} (${input.email})`,
      eyebrow: "Admin alert",
      title: "Wholesale application",
      bodyHtml,
      footerNote: "Internal notification — review in admin wholesale.",
    }),
    text: `Wholesale application from ${input.businessName} <${input.email}>. Terms: ${input.preferredTerms}.`,
    replyTo: input.email,
  };
}

export function customerNewsletterWelcome(email: string): EmailPayload {
  const bodyHtml = [
    paragraph(
      "You’re on the DIME members list. Expect drop alerts, promotions, and early access — no spam, just the good stuff."
    ),
    ctaButton("Browse the shop", siteUrl("/shop")),
    mutedNote("You can unsubscribe anytime by replying with “unsubscribe”."),
  ].join("");

  return {
    to: email,
    subject: "Welcome to the DIME members newsletter",
    html: emailLayout({
      preheader: "You’re subscribed to DIME drops and early access.",
      eyebrow: "Newsletter",
      title: "You’re on the list",
      bodyHtml,
    }),
    text: `Welcome to the DIME members newsletter. Shop: ${siteUrl("/shop")}`,
  };
}

export function adminNewsletterSignupNotification(email: string): EmailPayload {
  const bodyHtml = [
    paragraph("A new subscriber joined the members newsletter."),
    detailTable([{ label: "Email", value: escapeHtml(email) }]),
  ].join("");

  return {
    to: "",
    subject: `[DIME] Newsletter signup — ${email}`,
    html: emailLayout({
      preheader: `Newsletter: ${email}`,
      eyebrow: "Admin alert",
      title: "New newsletter signup",
      bodyHtml,
      footerNote: "Internal notification.",
    }),
    text: `Newsletter signup: ${email}`,
    replyTo: email,
  };
}

export type ContactFormEmailInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  orderId?: string;
};

export function customerContactConfirmation(input: ContactFormEmailInput): EmailPayload {
  const bodyHtml = [
    paragraph(
      `Thanks, <strong>${escapeHtml(input.name)}</strong>. We received your message and will reply from ${BRAND_EMAIL} as soon as we can.`
    ),
    detailTable([
      { label: "Subject", value: escapeHtml(input.subject) },
      ...(input.orderId ? [{ label: "Order ID", value: escapeHtml(input.orderId) }] : []),
    ]),
    `<div style="margin:8px 0 0;padding:16px;background:${BRAND.cream};border:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${BRAND.inkSoft};white-space:pre-wrap;">${escapeHtml(input.message)}</div>`,
    mutedNote("For authenticity or warranty issues, use Validate with your package code."),
  ].join("");

  return {
    to: input.email,
    subject: "We received your message — DIME Industries",
    html: emailLayout({
      preheader: "Your message to DIME support was received.",
      eyebrow: "Support",
      title: "Message received",
      bodyHtml,
    }),
    text: `Thanks ${input.name}. We received your message (${input.subject}). We'll reply soon.`,
  };
}

export function adminContactNotification(input: ContactFormEmailInput): EmailPayload {
  const bodyHtml = [
    paragraph("A customer submitted the contact form."),
    detailTable([
      { label: "Name", value: escapeHtml(input.name) },
      { label: "Email", value: escapeHtml(input.email) },
      { label: "Subject", value: escapeHtml(input.subject) },
      ...(input.orderId ? [{ label: "Order ID", value: escapeHtml(input.orderId) }] : []),
    ]),
    `<div style="margin:8px 0 0;padding:16px;background:${BRAND.cream};border:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${BRAND.inkSoft};white-space:pre-wrap;">${escapeHtml(input.message)}</div>`,
    ctaButton("Reply to customer", `mailto:${encodeURIComponent(input.email)}`),
  ].join("");

  return {
    to: "",
    subject: `[DIME] Contact — ${input.subject}`,
    html: emailLayout({
      preheader: `Contact from ${input.name} <${input.email}>`,
      eyebrow: "Admin alert",
      title: "New contact message",
      bodyHtml,
      footerNote: "Internal notification — reply to the customer email.",
    }),
    text: `Contact from ${input.name} <${input.email}>\nSubject: ${input.subject}\n\n${input.message}`,
    replyTo: input.email,
  };
}

export type PayoutEmailInput = {
  id: string;
  email: string;
  amountCents: number;
};

export function customerPayoutRequestConfirmation(input: PayoutEmailInput): EmailPayload {
  const amount = formatUsd(input.amountCents);
  const bodyHtml = [
    paragraph(
      `Your affiliate payout request for <strong>${amount}</strong> was submitted. We’ll notify you when it’s reviewed.`
    ),
    detailTable([
      { label: "Request", value: escapeHtml(input.id) },
      { label: "Amount", value: amount },
    ]),
  ].join("");

  return {
    to: input.email,
    subject: `Payout request received — ${amount}`,
    html: emailLayout({
      preheader: `Affiliate payout request ${input.id} submitted.`,
      eyebrow: "Affiliate",
      title: "Payout request received",
      bodyHtml,
    }),
    text: `Payout request ${input.id} for ${amount} received.`,
  };
}

export function adminPayoutRequestNotification(input: PayoutEmailInput): EmailPayload {
  const amount = formatUsd(input.amountCents);
  const bodyHtml = [
    paragraph("An affiliate requested a payout."),
    detailTable([
      { label: "Request", value: escapeHtml(input.id) },
      { label: "Affiliate", value: escapeHtml(input.email) },
      { label: "Amount", value: `<strong>${amount}</strong>` },
    ]),
    ctaButton("Review payouts", siteUrl("/admin/affiliate")),
  ].join("");

  return {
    to: "",
    subject: `[DIME] Affiliate payout request — ${amount}`,
    html: emailLayout({
      preheader: `Payout ${input.id} from ${input.email} · ${amount}`,
      eyebrow: "Admin alert",
      title: "Payout request",
      bodyHtml,
      footerNote: "Internal notification.",
    }),
    text: `Payout request ${input.id} from ${input.email}: ${amount}`,
    replyTo: input.email,
  };
}

export type ReturnRequestEmailInput = {
  id: string;
  orderId: string;
  email: string;
  reason: string;
};

export function customerReturnRequestConfirmation(input: ReturnRequestEmailInput): EmailPayload {
  const bodyHtml = [
    paragraph(
      "We received your return request and will review it shortly. You’ll get another email when a decision is made."
    ),
    detailTable([
      { label: "Request", value: escapeHtml(input.id) },
      { label: "Order", value: escapeHtml(input.orderId) },
      { label: "Reason", value: escapeHtml(input.reason) },
    ]),
    ctaButton("View returns", siteUrl("/account/returns")),
  ].join("");

  return {
    to: input.email,
    subject: `Return request received — ${input.orderId}`,
    html: emailLayout({
      preheader: `Return request ${input.id} for order ${input.orderId}.`,
      eyebrow: "Returns",
      title: "Return request received",
      bodyHtml,
    }),
    text: `Return request ${input.id} for order ${input.orderId} received. Reason: ${input.reason}`,
  };
}

export function adminReturnRequestNotification(input: ReturnRequestEmailInput): EmailPayload {
  const bodyHtml = [
    paragraph("A customer submitted a return request."),
    detailTable([
      { label: "Request", value: escapeHtml(input.id) },
      { label: "Order", value: escapeHtml(input.orderId) },
      { label: "Customer", value: escapeHtml(input.email) },
      { label: "Reason", value: escapeHtml(input.reason) },
    ]),
    ctaButton("Review returns", siteUrl("/admin/returns")),
  ].join("");

  return {
    to: "",
    subject: `[DIME] Return request — ${input.orderId}`,
    html: emailLayout({
      preheader: `Return ${input.id} from ${input.email}`,
      eyebrow: "Admin alert",
      title: "Return request",
      bodyHtml,
      footerNote: "Internal notification.",
    }),
    text: `Return request ${input.id} for order ${input.orderId} from ${input.email}: ${input.reason}`,
    replyTo: input.email,
  };
}

/** @deprecated Use customerOrderConfirmation — kept for call-site compatibility. */
export function orderConfirmationEmail(order: OrderEmailInput): EmailPayload {
  return customerOrderConfirmation(order);
}

export type OrderStatusEmail = "pending" | "payment_confirmed" | "cancelled" | "rejected";

export const ORDER_STATUS_LABELS: Record<OrderStatusEmail, string> = {
  pending: "Pending",
  payment_confirmed: "Payment confirmed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

function statusCopy(status: OrderStatusEmail): { title: string; body: string; eyebrow: string } {
  switch (status) {
    case "payment_confirmed":
      return {
        eyebrow: "Order update",
        title: "Payment confirmed",
        body: "We’ve confirmed payment for your order and are preparing it carefully.",
      };
    case "cancelled":
      return {
        eyebrow: "Order update",
        title: "Order cancelled",
        body: "Your order has been cancelled. If you didn’t request this or have questions, reply to this email and we’ll help.",
      };
    case "rejected":
      return {
        eyebrow: "Order update",
        title: "Order couldn’t be completed",
        body: "We weren’t able to complete this order. No further payment will be collected. Contact us if you need help placing a new order.",
      };
    case "pending":
    default:
      return {
        eyebrow: "Order update",
        title: "Order status: pending",
        body: "Your order is marked pending. We’ll email you again when payment is confirmed or if anything changes.",
      };
  }
}

/** Customer: order status changed (admin, payment webhook, or system). */
export function customerOrderStatusUpdate(input: {
  order: OrderEmailInput;
  status: OrderStatusEmail;
  previousStatus?: OrderStatusEmail;
}): EmailPayload {
  const { order, status, previousStatus } = input;
  const copy = statusCopy(status);
  const total = formatUsd(order.totalCents);
  const statusLabel = ORDER_STATUS_LABELS[status];
  const previousLabel = previousStatus ? ORDER_STATUS_LABELS[previousStatus] : null;

  const bodyHtml = [
    paragraph(copy.body),
    detailTable([
      { label: "Order", value: escapeHtml(order.id) },
      { label: "Status", value: `<strong>${escapeHtml(statusLabel)}</strong>` },
      ...(previousLabel && previousLabel !== statusLabel
        ? [{ label: "Previous", value: escapeHtml(previousLabel) }]
        : []),
      { label: "Total", value: total },
      { label: "Ship to", value: addressBlock(order) },
    ]),
    orderLinesTable(order.lines),
    ctaButton("View order", siteUrl(`/checkout/confirmation/${order.id}`)),
    mutedNote("You’re receiving this because the status of your DIME order changed."),
  ].join("");

  return {
    to: order.email,
    subject: `Order ${statusLabel.toLowerCase()} — ${order.id}`,
    html: emailLayout({
      preheader: `Order ${order.id} is now ${statusLabel.toLowerCase()}.`,
      eyebrow: copy.eyebrow,
      title: copy.title,
      bodyHtml,
    }),
    text: [
      `Order ${order.id} status: ${statusLabel}.`,
      previousLabel ? `Previous: ${previousLabel}` : null,
      `Total: ${total}`,
      `View: ${siteUrl(`/checkout/confirmation/${order.id}`)}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

