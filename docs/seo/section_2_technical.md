# Section 2 — Technical SEO (remaining work completed)

**Date:** 2026-08-03 (updated)  
**Canonical host in code:** `https://www.dimeindustries.us` (`lib/seo/site.ts`, `metadataBase`)  
**Vercel Domains:** apex `dimeindustries.us` → **308** → `www.dimeindustries.us` (Production)

## Host decision — Option B (done)

Preferred host is **www**, matching Vercel Production:

- [x] `SITE_URL` = `https://www.dimeindustries.us`
- [x] `metadataBase` = www
- [x] Product JSON-LD / `llms.txt` / `security.txt` aligned
- [x] Apex → www redirect already configured in Vercel (308)

**Owner env:** set `NEXT_PUBLIC_APP_URL=https://www.dimeindustries.us` on Vercel production, then redeploy.  
**GSC:** use a Domain property for `dimeindustries.us` (covers www + apex) and submit `https://www.dimeindustries.us/sitemap.xml`.

## Host redirects (code)

- `next.config.js` `redirects()` — apex host → `https://www.dimeindustries.us/:path*` (308/permanent)
- `vercel.json` matching host redirect (defense in depth with Vercel Domains)

## Shipped in code

| Item | Change |
|------|--------|
| Dynamic sitemap | `app/sitemap.ts` merges `listBlogPosts()` + `SEO_BLOG_SLUGS`, `revalidate = 300` |
| CMS meta + OG | `lib/seo/cms-meta.ts` + `(cms)/[...slug]/page.tsx` |
| Faceted noindex | `lib/seo/catalog-indexability.ts` on `/shop`, category, line `generateMetadata` |
| Age-gate SEO | Gate heading demoted to `h2`; SSR `AgeGateSeoTeaser` on home/shop/product (no prices) |
| CWV | Homepage preload `hero-poster.webp`; reduced-motion poster `fetchPriority=high` |
| HSTS | Added to `lib/security/headers.ts` + `vercel.json` |
| www canonical | Code + Vercel redirect aligned on www |

## Security headers checklist

Present: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `CSP`, **HSTS**.

## Still deferred / ongoing

- Full LCP ≤ 2.5s pass
- INP field measurement (RUM)
- Auto GSC sitemap ping on deploy

## Tests

`npm run test:unit -- tests/unit/seo-section2.test.ts`
