// lib/cart/types.ts

export type CartLineInput = {
  variantId: string;
  quantity: number;
};

export type CartLine = CartLineInput & {
  productSlug: string;
  productName: string;
  lineName: string;
  weightOrFormat: string;
  sku: string;
  unitPriceCents: number;
  thcPct: number;
  cbdPct: number;
  maxQuantity: number;
};

export type CartSnapshot = {
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
};

export const CART_COOKIE = "dime_cart";
export const CART_MAX_LINES = 30;
export const CART_MAX_QTY_PER_LINE = 20;
