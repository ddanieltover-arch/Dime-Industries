// lib/payments/types.ts

export type PaymentCurrency = "USD" | "BTC";

export type CreatePaymentSessionInput = {
  orderId: string;
  amountCents: number;
  currency: PaymentCurrency;
  customerEmail: string;
  successUrl: string;
  failureUrl: string;
  metadata?: Record<string, string>;
};

export type PaymentSession = {
  provider: "paybis";
  mode: "live" | "mock";
  /** Provider request / session id */
  requestId: string;
  /** URL to send the customer to (widget or mock pay page) */
  checkoutUrl: string;
  amountCents: number;
  currency: PaymentCurrency;
  createdAt: string;
};

export type PaymentWebhookEvent = {
  requestId: string;
  orderId: string | null;
  status: "pending" | "completed" | "rejected" | "cancelled";
  raw: unknown;
};

export interface PaymentProvider {
  readonly name: "paybis";
  createSession(input: CreatePaymentSessionInput): Promise<PaymentSession>;
  verifyWebhook(headers: Headers, body: string): Promise<PaymentWebhookEvent | null>;
}
