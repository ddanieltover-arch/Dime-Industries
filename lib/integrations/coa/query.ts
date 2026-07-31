// lib/integrations/coa/query.ts
/** Derive a human search string from catalog SKUs like V-MIAMI-ICE-1G. */
export function searchQueryFromSku(sku: string): string {
  return sku
    .replace(/^(V|E|A|P)-/i, "")
    .replace(/-(1G|2G|AIO|DEVICE)$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}
