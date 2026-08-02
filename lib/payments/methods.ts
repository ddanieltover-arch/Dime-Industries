// lib/payments/methods.ts — retail checkout payment methods + manual handles

export const MANUAL_PAYMENT_METHODS = ["cashapp", "apple_pay", "chime", "zelle"] as const;
export type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];

export const RETAIL_PAYMENT_METHODS = ["paybis_btc", ...MANUAL_PAYMENT_METHODS] as const;
export type RetailPaymentMethod = (typeof RETAIL_PAYMENT_METHODS)[number];

export type OrderPaymentMethod = RetailPaymentMethod | "net_terms";

/** Manual rails (Cash App, Apple Pay, Chime, Zelle) unlock at this order total. */
export const MANUAL_PAYMENT_MIN_TOTAL_CENTS = 30_000;

export const PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  paybis_btc: "Bitcoin",
  cashapp: "Cash App",
  apple_pay: "Apple Pay",
  chime: "Chime",
  zelle: "Zelle",
  net_terms: "Net terms",
};

export type ManualPaymentHandles = Partial<Record<ManualPaymentMethod, string>>;

export function isManualPaymentMethod(v: string): v is ManualPaymentMethod {
  return (MANUAL_PAYMENT_METHODS as readonly string[]).includes(v);
}

export function isRetailPaymentMethod(v: string): v is RetailPaymentMethod {
  return (RETAIL_PAYMENT_METHODS as readonly string[]).includes(v);
}

export function manualPaymentsAvailable(totalCents: number): boolean {
  return totalCents >= MANUAL_PAYMENT_MIN_TOTAL_CENTS;
}

export function paymentMethodLabel(method: string | null | undefined): string {
  if (!method) return "Payment";
  return PAYMENT_METHOD_LABELS[method as OrderPaymentMethod] ?? method;
}

/** Server-side handles shown on checkout + confirmation for manual pay. */
export function getManualPaymentHandles(): ManualPaymentHandles {
  return {
    cashapp: process.env.PAYMENT_CASHAPP_HANDLE?.trim() || undefined,
    apple_pay: process.env.PAYMENT_APPLE_PAY_HANDLE?.trim() || undefined,
    chime: process.env.PAYMENT_CHIME_HANDLE?.trim() || undefined,
    zelle: process.env.PAYMENT_ZELLE_HANDLE?.trim() || undefined,
  };
}

export function manualPaymentHint(method: ManualPaymentMethod): string {
  switch (method) {
    case "cashapp":
      return "Send the order total via Cash App, then include your order ID in the note.";
    case "apple_pay":
      return "Send the order total with Apple Cash / Apple Pay to the handle below, and include your order ID.";
    case "chime":
      return "Pay with Chime Pay Anyone / Chime Checkbook to the handle below, and include your order ID.";
    case "zelle":
      return "Send the order total via Zelle, and include your order ID in the memo.";
  }
}

/** Placeholder until PAYMENT_BTC_WALLET_ADDRESS is set. */
export const PLACEHOLDER_BTC_WALLET =
  "bc1qdimeplaceholderwalletreplacewithrealaddress000";

export function getBitcoinWalletAddress(): string {
  return process.env.PAYMENT_BTC_WALLET_ADDRESS?.trim() || PLACEHOLDER_BTC_WALLET;
}

export function isPlaceholderBitcoinWallet(address: string = getBitcoinWalletAddress()): boolean {
  return address === PLACEHOLDER_BTC_WALLET || !process.env.PAYMENT_BTC_WALLET_ADDRESS?.trim();
}
