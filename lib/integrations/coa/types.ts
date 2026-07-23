// lib/integrations/coa/types.ts
export type CoaRecord = {
  sku: string;
  productName: string | null;
  labName: string | null;
  testedAt: string | null;
  documentUrl: string;
  thcPct: number | null;
  cbdPct: number | null;
  status: "published" | "draft" | "unknown";
  source: "live" | "catalog" | "mock";
};
