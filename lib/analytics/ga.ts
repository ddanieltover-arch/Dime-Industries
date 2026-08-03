// lib/analytics/ga.ts — GA4 measurement ID + conversion event catalog

/** Production stream ID; override with NEXT_PUBLIC_GA_MEASUREMENT_ID when needed. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-N04NC98ZM8";

/**
 * Optional GTM container (GTM-XXXX). When set, load GTM instead of / in addition to
 * direct gtag — prefer one primary path to avoid double-counting. See section_8_analytics.md.
 */
export const GTM_CONTAINER_ID =
  process.env.NEXT_PUBLIC_GTM_CONTAINER_ID?.trim() || "";

/** Recommended GA4 / master-prompt conversion events used on this storefront. */
export const GA_CONVERSION_EVENTS = [
  "generate_lead",
  "purchase",
  "begin_checkout",
  "sign_up",
  "add_to_cart",
  "view_item",
  "click",
] as const;

export type GaConversionEvent = (typeof GA_CONVERSION_EVENTS)[number];

/**
 * Master-prompt events that do not apply to DIME storefront flows.
 * `schedule_appointment` — no booking product.
 */
export const GA_EVENTS_NOT_APPLICABLE = ["schedule_appointment"] as const;

export const GA_ENHANCED_MEASUREMENT = [
  "scroll",
  "outbound_clicks",
  "file_downloads",
  "video_engagement",
  "site_search",
] as const;
