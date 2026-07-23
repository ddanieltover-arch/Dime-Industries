// lib/format.ts
// Shared formatting helpers — keep currency/number display consistent across
// product cards, PDP, cart (Sprint 2), and admin.

export function formatPrice(cents: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

export function formatPct(value: number | null | undefined, digits = 1) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}
