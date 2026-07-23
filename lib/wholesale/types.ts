// lib/wholesale/types.ts
export const WHOLESALE_CART_COOKIE = "dime_wholesale_cart";
export const WHOLESALE_ACCOUNTS_COOKIE = "dime_wholesale_accounts";
export const WHOLESALE_OVERRIDES_COOKIE = "dime_wholesale_overrides";

/** Default: 30% off retail (buyer pays 70%). */
export const WHOLESALE_PRICE_BPS = 7000;
export const WHOLESALE_DEFAULT_MOQ = 5;
export const WHOLESALE_MAX_QTY_PER_LINE = 200;
export const WHOLESALE_MIN_ORDER_CENTS = 25000; // $250

export type PaymentTerms = "net30" | "net60" | "upfront";
export type WholesaleAccountStatus = "pending" | "approved" | "rejected";

export type WholesaleAccount = {
  email: string;
  businessName: string;
  licenseNumber: string | null;
  resaleCertUrl: string | null;
  status: WholesaleAccountStatus;
  defaultPaymentTerms: PaymentTerms;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
};

export type WholesalePriceOverride = {
  variantId: string;
  priceCents: number;
  minQuantity: number;
};

export type WholesaleApplyInput = {
  email: string;
  businessName: string;
  licenseNumber?: string;
  resaleCertUrl?: string;
  preferredTerms?: PaymentTerms;
};
