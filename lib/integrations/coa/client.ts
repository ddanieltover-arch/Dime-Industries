// lib/integrations/coa/client.ts
import "server-only";
import { resolveCoaApiBase } from "@/lib/integrations/hosts";
import { searchQueryFromSku } from "./query";
import type { CoaRecord } from "./types";

export { searchQueryFromSku };

type HerokuCoaRow = {
  id: string;
  product_name?: string | null;
  batch_number?: string | null;
  lab_name?: string | null;
  completed_date?: string | null;
  thc_percent?: number | null;
  cbd_percent?: number | null;
  status?: string | null;
  sku?: string | null;
  state?: string | null;
};

function coaConfigured() {
  return Boolean(resolveCoaApiBase());
}

function allowlistedUrl(pathAndQuery: string): URL | null {
  const base = resolveCoaApiBase();
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

function mapStatus(raw: string | null | undefined): CoaRecord["status"] {
  const s = (raw || "").toLowerCase();
  if (s === "passed" || s === "published") return "published";
  if (s === "failed" || s === "draft") return "draft";
  return "unknown";
}

function mapHerokuRow(row: HerokuCoaRow, sku: string, base: string): CoaRecord {
  return {
    sku: row.sku || sku,
    productName: row.product_name ?? null,
    labName: row.lab_name ?? null,
    testedAt: row.completed_date ?? null,
    documentUrl: `${base.replace(/\/$/, "")}/coa/${row.id}`,
    thcPct: typeof row.thc_percent === "number" ? row.thc_percent : null,
    cbdPct: typeof row.cbd_percent === "number" ? row.cbd_percent : null,
    status: mapStatus(row.status),
    source: "live",
  };
}

/** Mock / catalog fallback when live host absent or errors. */
export function catalogCoaFallback(sku: string, catalogUrl: string | null | undefined): CoaRecord | null {
  return {
    sku,
    productName: null,
    labName: coaConfigured() ? null : "DIME Third-Party Lab (mock)",
    testedAt: coaConfigured() ? null : "2026-06-01",
    documentUrl:
      catalogUrl && !catalogUrl.startsWith("/lab-results")
        ? catalogUrl
        : `/lab-results?sku=${encodeURIComponent(sku)}`,
    thcPct: null,
    cbdPct: null,
    status: "published",
    source: coaConfigured() ? "catalog" : "mock",
  };
}

async function searchHerokuCoas(query: string): Promise<HerokuCoaRow | null> {
  const url = allowlistedUrl(
    `/api/coas?${new URLSearchParams({
      q: query,
      limit: "5",
      page: "1",
      sort: "completed_date",
      order: "desc",
    }).toString()}`
  );
  if (!url) return null;

  const headers: HeadersInit = { Accept: "application/json" };
  const key = process.env.COA_API_KEY?.trim();
  if (key) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(4000),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: HerokuCoaRow[] };
  return json.data?.[0] ?? null;
}

async function fetchContractV1(sku: string): Promise<CoaRecord | null> {
  const url = allowlistedUrl(`/v1/coa?sku=${encodeURIComponent(sku)}`);
  if (!url) return null;

  const headers: HeadersInit = { Accept: "application/json" };
  const key = process.env.COA_API_KEY?.trim();
  if (key) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(3000),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Partial<CoaRecord> & { documentUrl?: string };
  if (!data.documentUrl) return null;
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
}

const COA_FETCH_BUDGET_MS = 800;

export async function fetchCoaBySku(
  sku: string,
  catalogUrl?: string | null,
  productName?: string | null
): Promise<CoaRecord | null> {
  const fallback = catalogCoaFallback(sku, catalogUrl);
  const base = resolveCoaApiBase();
  if (!base) return fallback;

  const queries = [
    productName?.replace(/\s*[|:–—-].*$/, "").trim(),
    productName?.trim(),
    searchQueryFromSku(sku),
    sku,
  ].filter((q): q is string => Boolean(q && q.length >= 2));

  const live = (async (): Promise<CoaRecord | null> => {
    try {
      for (const q of [...new Set(queries)]) {
        const row = await searchHerokuCoas(q);
        if (row?.id) return mapHerokuRow(row, sku, base);
      }

      const contract = await fetchContractV1(sku);
      if (contract) return contract;
    } catch (err) {
      console.warn("[coa] fetch failed", sku, err);
    }
    return null;
  })();

  // Never let a slow/unreachable COA host stall PDP or lab-results HTML.
  const winner = await Promise.race([
    live,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), COA_FETCH_BUDGET_MS);
    }),
  ]);

  return winner ?? fallback;
}

/**
 * Lightweight live probe for catalog cards — fewer remote calls than full fetchCoaBySku.
 * Returns true only when the live host answers for this SKU/name.
 */
export async function probeCoaLive(
  sku: string,
  productName?: string | null
): Promise<boolean> {
  if (!coaConfigured()) return false;

  try {
    const contract = await fetchContractV1(sku);
    if (contract) return true;

    const q =
      productName?.replace(/\s*[|:–—-].*$/, "").trim() ||
      searchQueryFromSku(sku) ||
      sku;
    if (q.length < 2) return false;
    const row = await searchHerokuCoas(q);
    return Boolean(row?.id);
  } catch {
    return false;
  }
}

/**
 * Mark cards that have a lab COA link.
 *
 * Previously this probed the live Heroku COA host for every card (chunked
 * sequential HTTP). That blocked shop/home HTML for seconds in production.
 * List UIs now use catalog COA URL presence; PDP still calls fetchCoaBySku.
 */
export async function applyLiveCoaToCards(
  cards: import("@/lib/catalog/types").ProductCardModel[]
): Promise<import("@/lib/catalog/types").ProductCardModel[]> {
  return cards.map((c) => ({
    ...c,
    coaLive: Boolean(c.coaUrl),
  }));
}

export function getCoaIntegrationStatus() {
  const base = resolveCoaApiBase();
  return {
    configured: Boolean(base),
    mode: base ? ("live" as const) : ("mock" as const),
    base: base ?? null,
  };
}
