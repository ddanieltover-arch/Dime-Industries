// lib/checkout/types.ts
import type { CartLine } from "@/lib/cart/types";
import type { LaunchJurisdiction } from "@/lib/compliance/age-gate";
import type { OrderPaymentMethod } from "@/lib/payments/methods";
import type { CheckoutAddress, PricingBreakdown } from "./pricing";

export type OrderStatus =
  | "pending"
  | "payment_confirmed"
  | "cancelled"
  | "rejected";

export type CheckoutOrder = {
  id: string;
  status: OrderStatus;
  email: string;
  address: CheckoutAddress;
  jurisdiction: LaunchJurisdiction;
  lines: CartLine[];
  subtotalCents: number;
  discountCents: number;
  discountLabel: string | null;
  couponCode: string | null;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  taxLabel: string;
  shippingLabel: string;
  paymentMethod: OrderPaymentMethod;
  paymentRequestId: string | null;
  paymentMode: "live" | "mock" | null;
  createdAt: string;
  paidAt: string | null;
  /** Phase 2 wholesale */
  channel?: "retail" | "wholesale";
  paymentTerms?: "net30" | "net60" | "upfront" | null;
  wholesaleBusinessName?: string | null;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscountCents?: number;
  /** Optional fulfillment / tracking (admin or ops may set later) */
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
};

export type CreateOrderInput = {
  email: string;
  address: CheckoutAddress;
  jurisdiction: LaunchJurisdiction;
  lines: CartLine[];
  pricing: PricingBreakdown;
  channel?: "retail" | "wholesale";
  paymentTerms?: "net30" | "net60" | "upfront" | null;
  paymentMethod?: OrderPaymentMethod;
  wholesaleBusinessName?: string | null;
  /** When true, order starts as payment_confirmed (NET invoice accepted). */
  acceptOnTerms?: boolean;
};

export type OrderListOptions = { email?: string; limit?: number };

export type OrderRepository = {
  readonly mode: "cookie" | "database";
  list(options?: OrderListOptions): Promise<CheckoutOrder[]>;
  getById(orderId: string): Promise<CheckoutOrder | null>;
  getByPaymentRequestId(paymentRequestId: string): Promise<CheckoutOrder | null>;
  create(input: CreateOrderInput): Promise<CheckoutOrder>;
  update(
    orderId: string,
    patch: Partial<
      Pick<CheckoutOrder, "status" | "paymentRequestId" | "paymentMode" | "paidAt">
    >
  ): Promise<CheckoutOrder | null>;
  markPaid(orderId: string): Promise<CheckoutOrder | null>;
  markPaidByPaymentRequestId(paymentRequestId: string): Promise<CheckoutOrder | null>;
};

export const ORDERS_COOKIE = "dime_orders";
export const ORDERS_COOKIE_MAX = 8;
