// app/api/search/suggest/route.ts
import { NextResponse } from "next/server";
import { withCatalogSource } from "@/lib/catalog";
import { suggestCatalog } from "@/lib/catalog/suggest";
import { loadEffectiveCatalog } from "@/lib/catalog/effective";
import { getAgeGateState } from "@/lib/compliance/age-gate";
import { clientIpFromRequest, rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 90;
const RATE_WINDOW_MS = 60_000;

/**
 * GET /api/search/suggest?q=
 * Age-gated autocomplete. Returns ranked products + matching categories/lines.
 */
export async function GET(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`search-suggest:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many requests", suggestions: [] },
      {
        status: 429,
        headers: {
          "Retry-After": String(limited.retryAfterSec),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const gate = await getAgeGateState();
  if (!gate.ageVerified) {
    return NextResponse.json(
      { ageRequired: true, query: "", suggestions: [] },
      {
        status: 401,
        headers: { "X-RateLimit-Remaining": String(limited.remaining) },
      }
    );
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limitRaw = Number(url.searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 8;

  if (q.length < 2) {
    return NextResponse.json(
      { query: q, suggestions: [], ageRequired: false },
      {
        headers: {
          "Cache-Control": "private, max-age=0",
          "X-RateLimit-Remaining": String(limited.remaining),
        },
      }
    );
  }

  const catalog = await loadEffectiveCatalog();
  const result = withCatalogSource(catalog, () =>
    suggestCatalog(q, { jurisdiction: gate.jurisdiction, limit })
  );

  return NextResponse.json(
    { ...result, ageRequired: false },
    {
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
        "X-RateLimit-Remaining": String(limited.remaining),
      },
    }
  );
}
