// lib/account/validate-product.ts
// Anti-counterfeit / warranty registration stub — codes validated against
// seed catalog SKUs until the live validation API is integrated (D4).

import { getCatalogSource } from "@/lib/catalog/query";

export type ValidationResult =
  | {
      ok: true;
      sku: string;
      productName: string;
      productSlug: string;
      message: string;
    }
  | { ok: false; message: string };

const USED_CODES = new Set<string>();

export function normalizeValidationCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function validateProductCode(raw: string): ValidationResult {
  const code = normalizeValidationCode(raw);
  if (code.length < 6) {
    return { ok: false, message: "Enter the full code from your product package." };
  }

  if (USED_CODES.has(code)) {
    return {
      ok: false,
      message: "This code was already registered. Contact support if you need warranty help.",
    };
  }

  // Accept either exact SKU or SKU with a check suffix (e.g. LR-GELATO-1G-AB12)
  const catalog = getCatalogSource();
  for (const product of catalog) {
    for (const variant of product.variants) {
      const sku = variant.sku.toUpperCase();
      if (code === sku || code.startsWith(`${sku}-`)) {
        USED_CODES.add(code);
        return {
          ok: true,
          sku: variant.sku,
          productName: product.name,
          productSlug: product.slug,
          message: "Product verified. Limited warranty activated for this device.",
        };
      }
    }
  }

  return {
    ok: false,
    message: "Code not recognized. Buy only from licensed retailers and try again.",
  };
}
