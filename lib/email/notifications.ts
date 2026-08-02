// lib/email/notifications.ts
// Dual-send helpers: customer confirmation + admin alert via Resend.

import "server-only";
import { getAdminEmail, sendEmailPayload, type SendEmailResult } from "./resend";
import {
  adminContactNotification,
  adminNewsletterSignupNotification,
  adminOrderNotification,
  adminPayoutRequestNotification,
  adminWholesaleApplicationNotification,
  customerContactConfirmation,
  customerNewsletterWelcome,
  customerOrderConfirmation,
  customerOrderStatusUpdate,
  adminReturnRequestNotification,
  customerPayoutRequestConfirmation,
  customerReturnRequestConfirmation,
  customerWholesaleApplicationReceived,
  type ContactFormEmailInput,
  type OrderEmailInput,
  type OrderStatusEmail,
  type PayoutEmailInput,
  type ReturnRequestEmailInput,
  type WholesaleApplicationEmailInput,
} from "./templates";

export type DualNotifyResult = {
  customer: SendEmailResult;
  admin: SendEmailResult;
};

async function dualSend(
  customerPayload: Parameters<typeof sendEmailPayload>[0],
  adminPayload: Parameters<typeof sendEmailPayload>[0]
): Promise<DualNotifyResult> {
  const adminEmail = getAdminEmail();
  const admin = { ...adminPayload, to: adminEmail };

  const [customer, adminResult] = await Promise.all([
    sendEmailPayload(customerPayload),
    sendEmailPayload(admin),
  ]);

  if (!customer.ok) console.warn("[email] customer send failed", customer.error);
  if (!adminResult.ok) console.warn("[email] admin send failed", adminResult.error);

  return { customer, admin: adminResult };
}

export async function notifyOrderConfirmed(order: OrderEmailInput): Promise<DualNotifyResult> {
  return dualSend(customerOrderConfirmation(order), adminOrderNotification(order));
}

/** Customer-only notice when an order’s status changes. */
export async function notifyOrderStatusChanged(
  order: OrderEmailInput,
  status: OrderStatusEmail,
  previousStatus?: OrderStatusEmail
): Promise<SendEmailResult> {
  const result = await sendEmailPayload(
    customerOrderStatusUpdate({ order, status, previousStatus })
  );
  if (!result.ok) console.warn("[email] order status notify failed", result.error);
  return result;
}

export async function notifyWholesaleApplication(
  input: WholesaleApplicationEmailInput
): Promise<DualNotifyResult> {
  return dualSend(
    customerWholesaleApplicationReceived(input),
    adminWholesaleApplicationNotification(input)
  );
}

export async function notifyNewsletterSignup(email: string): Promise<DualNotifyResult> {
  return dualSend(customerNewsletterWelcome(email), adminNewsletterSignupNotification(email));
}

export async function notifyContactForm(
  input: ContactFormEmailInput
): Promise<DualNotifyResult> {
  return dualSend(customerContactConfirmation(input), adminContactNotification(input));
}

export async function notifyPayoutRequest(input: PayoutEmailInput): Promise<DualNotifyResult> {
  return dualSend(
    customerPayoutRequestConfirmation(input),
    adminPayoutRequestNotification(input)
  );
}

export async function notifyReturnRequest(
  input: ReturnRequestEmailInput
): Promise<DualNotifyResult> {
  return dualSend(
    customerReturnRequestConfirmation(input),
    adminReturnRequestNotification(input)
  );
}
