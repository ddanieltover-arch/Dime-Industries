// lib/analytics/track.ts — client-safe gtag helpers (no-op without consent / gtag)
"use client";

export type GaItem = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isGtagReady(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/** Fire a GA4 event. Silently no-ops when analytics cookies were declined. */
export function trackGaEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (!isGtagReady()) return;
  window.gtag!("event", name, params);
}

export function trackPageView(path: string, title?: string): void {
  trackGaEvent("page_view", {
    page_path: path,
    page_title: title ?? document.title,
  });
}

export function trackViewItem(item: GaItem, valueUsd?: number): void {
  trackGaEvent("view_item", {
    currency: "USD",
    value: valueUsd,
    items: [item],
  });
}

export function trackAddToCart(item: GaItem, valueUsd?: number): void {
  trackGaEvent("add_to_cart", {
    currency: "USD",
    value: valueUsd,
    items: [item],
  });
}

export function trackBeginCheckout(valueUsd: number, items?: GaItem[]): void {
  trackGaEvent("begin_checkout", {
    currency: "USD",
    value: valueUsd,
    items,
  });
}

export function trackPurchase(opts: {
  transactionId: string;
  valueUsd: number;
  items?: GaItem[];
}): void {
  trackGaEvent("purchase", {
    transaction_id: opts.transactionId,
    currency: "USD",
    value: opts.valueUsd,
    items: opts.items,
  });
}

export function trackGenerateLead(formId: string): void {
  trackGaEvent("generate_lead", { form_id: formId });
}

export function trackSignUp(method = "email"): void {
  trackGaEvent("sign_up", { method });
}

export function trackClick(opts: {
  linkUrl: string;
  linkText?: string;
  outbound?: boolean;
}): void {
  trackGaEvent("click", {
    link_url: opts.linkUrl,
    link_text: opts.linkText,
    outbound: opts.outbound ?? false,
  });
}
