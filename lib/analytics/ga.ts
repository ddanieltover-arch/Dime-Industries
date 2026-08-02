// lib/analytics/ga.ts — GA4 measurement ID (public; env overrides default)

/** Production stream ID; override with NEXT_PUBLIC_GA_MEASUREMENT_ID when needed. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-N04NC98ZM8";
