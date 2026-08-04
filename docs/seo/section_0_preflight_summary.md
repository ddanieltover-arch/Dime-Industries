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

1. **CRITICAL — Dime roll fact check:** SERPs say **50 dimes / $5**; site blog says **40 / $4**. Fix before ranking push.
2. **HIGH — Age gate HTML:** 8 probed catalog/product routes show H1 “Are you over 21?” without cookie (thin ~200-word HTML).
3. **HIGH — www vs apex:** Canonical/sitemap apex vs live www — consolidate redirects + GSC property.
4. **HIGH — LCP:** Home LCP ~3.6s (fail); other landers ~2.7–3.5s (fail threshold 2.5s). Homepage CLS ~0.15 (fail).
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
