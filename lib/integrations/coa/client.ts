// lib/integrations/coa/client.ts
import "server-only";
import type { CoaRecord } from "./types";

function coaConfigured() {
  return Boolean(process.env.COA_API_BASE?.trim());
}

function allowlistedUrl(pathAndQuery: string): URL | null {
  const base = process.env.COA_API_BASE?.trim();
  if (!base) return null;
  try {
    const origin = new URL(base);
    const url = new URL(pathAndQuery, origin);
    if (url.origin !== origin.origin) return null;
    return url;
  } catch {
    return null;
  }
}

/** Mock / catalog fallback when live host absent or errors. */
export function catalogCoaFallback(sku: string, catalogUrl: string | null | undefined): CoaRecord | null {
  if (!catalogUrl) return null;
  return {
    sku,
    productName: null,
    labName: null,
    testedAt: null,
    documentUrl: catalogUrl,
    thcPct: null,
    cbdPct: null,
    status: "published",
    source: coaConfigured() ? "catalog" : "mock",
  };
}

export async function fetchCoaBySku(
  sku: string,
  catalogUrl?: string | null
): Promise<CoaRecord | null> {
  const url = allowlistedUrl(`/v1/coa?sku=${encodeURIComponent(sku)}`);
  if (!url) return catalogCoaFallback(sku, catalogUrl);

  const headers: HeadersInit = { Accept: "application/json" };
  const key = process.env.COA_API_KEY?.trim();
  if (key) headers.Authorization = `Bearer ${key}`;

  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return catalogCoaFallback(sku, catalogUrl);
    if (!res.ok) return catalogCoaFallback(sku, catalogUrl);
    const data = (await res.json()) as Partial<CoaRecord> & { documentUrl?: string };
    if (!data.documentUrl) return catalogCoaFallback(sku, catalogUrl);
    return {
      sku: data.sku ?? sku,
      productName: data.productName ?? null,
      labName: data.labName ?? null,
      testedAt: data.testedAt ?? null,
      documentUrl: data.documentUrl,
      thcPct: data.thcPct ?? null,
      cbdPct: data.cbdPct ?? null,
      status: data.status === "draft" ? "draft" : "published",
      source: "live",
    };
  } catch (err) {
    console.warn("[coa] fetch failed", sku, err);
    return catalogCoaFallback(sku, catalogUrl);
  }
}

export function getCoaIntegrationStatus() {
  return {
    configured: coaConfigured(),
    mode: coaConfigured() ? ("live" as const) : ("mock" as const),
  };
}
