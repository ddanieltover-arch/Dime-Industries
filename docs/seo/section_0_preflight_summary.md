# Section 0 — Pre-flight Audit Summary

**Generated:** 2026-08-02T22:55:21.643Z  
**Live host probed:** https://www.dimeindustries.us  
**Sitemap URLs:** 137

## Artifacts

| File | Purpose |
|------|---------|
| `audit_report.json` | Structured findings + detailed probes |
| `crawl_inventory.csv` | Sitemap inventory + deep fields on key URLs |
| `core_web_vitals_baseline.json` | Mobile Lighthouse baselines |
| `seo_baseline.json` | GSC/GA4/robots/sitemap status |
| `competitor_report.csv` | Top organic competitors from seed SERPs |

## Critical / high findings

1. **RESOLVED — Dime roll fact check:** Seed + live content state **50 dimes / $5** (guarded by `seo-audit` + unit tests). Re-verify after CMS DB overrides.
2. **HIGH — Age gate HTML:** 8 probed catalog/product routes show H1 “Are you over 21?” without cookie (thin ~200-word HTML).
3. **RESOLVED — www vs apex:** Canonical host is **www**; apex → www permanent redirects in `next.config.js` + `vercel.json`. Confirm GSC Domain property.
4. **IN PROGRESS — LCP/CLS:** Home hero defers ~49MB MP4 until idle; poster + Gotham preload; age-gate entrance opacity removed. Re-run Lighthouse after deploy (target LCP ≤2.5s, CLS ≤0.1).
5. **HIGH — Legacy .com cannibalization:** `dimeindustries.com` still owns brand SERPs.

## CWV snapshot (mobile lab)

See `core_web_vitals_baseline.json`. TTFB is healthy (~70ms). LCP is the primary budget miss.

## Baseline gaps (owner)

- GSC connection / sitemap submission: **not verified**
- GA4 measurement ID in app: **not present**
- DA / indexed page counts: **need Ahrefs/Moz + GSC**

## Re-run

```bash
node scripts/seo-preflight-assemble.mjs
```
