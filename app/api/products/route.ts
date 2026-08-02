// app/api/products/route.ts
import { NextResponse } from "next/server";
import { listProducts, parseCatalogSearchParams, withCatalogSource } from "@/lib/catalog";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import {
  getActiveLaunchJurisdictions,
  isActiveLaunchJurisdiction,
} from "@/lib/admin/site-settings-store";
import { clientIpFromRequest, rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

/**
 * GET /api/products
 * Public catalog list — jurisdiction-filtered. Age gate is enforced on HTML
 * pages; this API still requires an explicit jurisdiction query for pricing
 * honesty (or returns only products valid in all active launch jurisdictions).
 */
export async function GET(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`products:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(limited.retryAfterSec),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const jurisdictionRaw = params.jurisdiction;
  const jurisdiction =
    jurisdictionRaw && (await isActiveLaunchJurisdiction(jurisdictionRaw))
      ? (jurisdictionRaw as "CA" | "MA")
      : null;

  const filters = parseCatalogSearchParams(params);
  const catalog = await loadEffectiveCatalog();
  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    "X-RateLimit-Remaining": String(limited.remaining),
  };
  const activeJurisdictions = await getActiveLaunchJurisdictions();

  return withCatalogSource(catalog, () => {
    if (!jurisdiction) {
      const all = listProducts({ ...filters, jurisdiction: undefined });
      const items = all.items.filter((item) => {
        const sets = activeJurisdictions.map(
          (j) =>
            new Set(
              listProducts({ ...filters, jurisdiction: j, pageSize: 1000 }).items.map((i) => i.slug)
            )
        );
        return sets.every((s) => s.has(item.slug));
      });
      return NextResponse.json(
        {
          items,
          total: items.length,
          page: 1,
          pageSize: items.length,
          facets: all.facets,
          jurisdiction: null,
        },
        { headers: cacheHeaders }
      );
    }

    const result = listProducts({ ...filters, jurisdiction });
    return NextResponse.json({ ...result, jurisdiction }, { headers: cacheHeaders });
  });
}
