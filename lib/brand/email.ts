// lib/brand/email.ts
/** Sole public + transactional contact address for DIME Industries. */
export const BRAND_EMAIL = "sales@dimeindustries.us";

export const BRAND_FROM = `DIME Industries <${BRAND_EMAIL}>`;

export function mailtoBrand(subject?: string): string {
  if (!subject) return `mailto:${BRAND_EMAIL}`;
  return `mailto:${BRAND_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
