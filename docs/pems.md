# Pulse Engineering Memory System (PEMS) — Project Record

*Fill one record per project. Save as `docs/pems.md` in the project repo. Read before starting work; update after major decisions.*

**PEMS Version:** 1.0  
**Last Updated:** 2026-08-18  
**Updated By:** Senior Full Stack (Pulse) — shop/home fail-fast catalog + CMS timeouts  

**Primary codebase:** `dime-enterprise-commerce/` (git repo). Workspace also holds `claude-devos-enterprise/`, `motion-ux-enhancement-expert/`, and SEO research assets. Mirror: `dime-enterprise-commerce/docs/pems.md`.

---

## Context Snapshot

*Concise first-read for every specialist — keep this current.*

| Field | Value |
|---|---|
| Project | DIME Industries — Enterprise Commerce Platform |
| Current version | `0.1.0` (`package.json`); git `main` @ `f11516e` + hotfix (theme boot / PWA v2) |
| Current sprint / phase | **Launch / Maintain** — production live on `www.dimeindustries.us`; SEO program active |
| Architecture (one line) | Next.js 15 App Router modular monolith — storefront + account + admin + wholesale; Supabase Auth/Postgres + Drizzle; Vercel |
| Tech stack (one line) | TypeScript, Next 15, React 19, Tailwind 4, Drizzle, Supabase, Zod, CSS motion/tiny reveal, Vitest, Playwright, Sentry |
| Design system | DIME brand tokens in `app/globals.css` — dark concrete + resin gold; Gotham / Retro Signature |
| Primary risks | Age-gate crawlability vs compliance; LCP/CLS budgets; `.com` SEO cannibalization; cannabis legal/compliance |
| Open decisions | Confirm live Paybis vs mock for public launch; GSC/GA4 owner setup; legal review of worldwide ship-to vs cannabis regs |
| Recent changes | **Perf:** catalog/CMS DB budgets so /shop does not stick on loading skeletons; PWA `dime-pwa-v3` aborts hung navigations at 8s. Prior: keyword-gap posts + ranking SKU titles |
| Next priorities | Deploy fail-fast catalog; hard-refresh SW to v3; re-time live TTFB |

---

## 1. Project Profile

| Field | Value |
|---|---|
| Name | DIME Enterprise Commerce Platform (`dime-enterprise-commerce`) |
| Description | Licensed cannabis marketplace (retail + wholesale) for DIME Industries — consolidates brand marketing, catalog, checkout, loyalty, COA/lab results, and admin into one Next.js platform. Built via Claude DevOS Enterprise phases (SRS → Architecture → DB → Backend → Frontend → QA → DevOps), now under Pulse Software Studio engagement. |
| Goals | Production DTC + wholesale commerce for CA/MA launch jurisdictions; replace fragmented WordPress/Heroku brand surfaces with one compliant, durable storefront; grow organic/AI visibility via SEO+GEO. |
| Target users | 21+ adult-use retail customers (CA, MA); wholesale buyers (NET-30/60 or BTC upfront); platform admins |
| Industry / domain | Cannabis / hemp DTC commerce (regulated adult-use) |
| Key features | Age gate (21+); jurisdiction-aware catalog; shop/PDP/cart/checkout (Paybis BTC); account portal; admin back office; CMS/blog; coupons; loyalty + affiliate; wholesale apply/shop; COA + AI assistant adapters; PWA; SEO/schema/GEO; returns (schema `0011`) |
| Phase | **Launch** (soft-launch on Vercel; custom domain owner-gated) transitioning to **Maintain** + SEO growth |
| Ownership (client / Pulse / stakeholders) | Client: DIME Industries. Delivery: Pulse Software Studio. Prior build history in `docs/` (DevOS sprint charters 00–46). |
| Success metrics | Durable orders with `DATABASE_URL`; production smoke/`/api/ready` green; Lighthouse/CWV targets (LCP &lt; 2.5s, WCAG 2.2 AA); SEO indexation + keyword map execution; DNS live on `dimeindustries.us` |

---

## 2. Technology Profile

| Layer | Choice | Notes / version |
|---|---|---|
| Language(s) | TypeScript 5.6 | Strict app + scripts (`tsx`) |
| Web framework | Next.js 15.5 App Router | `app/`; React 19 |
| Mobile framework | N/A (responsive web + PWA) | `components/pwa`, service worker |
| Backend | Next.js Route Handlers + server modules | `app/api/*`, `lib/*` |
| Database | PostgreSQL via Supabase | Migrations `db/migrations/0001`–`0011` |
| ORM / data layer | Drizzle ORM 0.33 + `postgres` | `db/schema.ts`; cookie/session fallbacks when DB unset |
| Auth | Supabase Auth (email/password + Google OAuth) | Demo auth cookie when Supabase unset (blocked in prod unless `ALLOW_DEMO_AUTH`) |
| Styling | Tailwind CSS 4 + CSS variables | `@import "tailwindcss"`; tokens in `globals.css` |
| State / data fetching | Server components + cookies/session; React client islands | Cart/wishlist cookie + DB sync when authenticated |
| Forms / validation | Zod 3.23 | API and form schemas |
| Animation | CSS tiny reveal + motion tokens (no Framer) | `components/motion` + `.dime-reveal` / stagger / fade-in; `prefers-reduced-motion` respected |
| Testing | Vitest 2 + Playwright 1.47 | Broad unit coverage; e2e: home/shop/cart/checkout/cms/coupon |
| CI/CD | GitHub Actions | `ci.yml`, `deploy-staging.yml`, `deploy-production.yml`, SEO workflows |
| Hosting | Vercel | Prod app: `https://dime-industries.vercel.app`; target: `dimeindustries.us` |
| AI / LLM (if any) | External Budtender assistant adapter | `ASSISTANT_API_BASE` → DIME Heroku default; mock when `off` |
| Other services | Paybis (BTC), Resend, Sentry, COA Heroku host, Rewards SPA URL | See `lib/integrations/` |

**Documented exceptions to PSEF:** Pre-Pulse DevOS naming and sprint-doc numbering retained in `docs/`; feature folders under `app/` + `components/` + `lib/` rather than a single `features/` root — acceptable modular monolith shape.

---

## 3. Architecture Profile

| Field | Value |
|---|---|
| Architecture style | Modular monolith — feature-sliced App Router (commerce, account, admin, wholesale, CMS, compliance) |
| Folder structure summary | `app/(storefront)/` pages + chrome · `app/admin` · `app/api` · action groups · `components/` · `lib/` · `db/` · `tests/` · `docs/` · `public/` |
| Routing strategy | App Router; **`(storefront)`** owns RSC header/footer; `(cms)` nested under storefront; action groups at root |
| API strategy | REST Route Handlers (`/api/products`, `/api/cart`, `/api/health`, `/api/ready`, `/api/search`, `/api/webhooks/*`) + server-side repositories |
| Auth model | Supabase session middleware + role gates (`guest` / `customer` / `wholesale` / `admin` / `vendor`); lateral roles (not numeric ladder) |
| State management | Cookie carts/wishlists for guests; Postgres persistence for orders, CMS, coupons, loyalty, affiliate, inventory, wholesale when `DATABASE_URL` set |
| Caching strategy | CDN/static where possible; Next image AVIF/WebP; security headers via `lib/security/headers.cjs` |
| Background jobs | Vercel Cron / scripts (SEO crawl, Lighthouse); load-test & cutover verify scripts |
| Multi-tenancy | Single brand (DIME); jurisdiction gating CA/MA; vendor role reserved, multi-vendor not built |
| Key integration points | Paybis webhooks; COA host; Assistant chat; Rewards URL/API; Resend; Sentry; Supabase Storage for media |

**Architecture Decision Records (summary):**

| ID | Decision |
|---|---|
| D1 | Launch jurisdictions: CA + MA |
| D2 | Age verification: 21+ flat |
| D3 | Fulfillment: platform is licensed seller of record |
| D4 | COA + Rewards: integrate existing hosted systems (adapters) |
| D5 | Wholesale: Phase 2 (delivered Sprint 14) |
| D6 | Payment at launch: Paybis BTC only |
| D7 | Architecture & Design Gate approved → Sprint 1 |

Source: `dime-enterprise-commerce/docs/10-decisions-d1-d7-locked.md`. Soft-launch debt D-01–D-24 closed in Sprints 10–15 (`docs/27-soft-launch-debt.md`).

---

## 4. Design Profile

| Field | Value |
|---|---|
| Brand / product name | DIME Industries |
| Design system name / location | Inline design language — `app/globals.css` + `components/ui` / `components/shared` |
| Color tokens (summary or path) | Dark concrete `#0e0e0e` / surfaces; resin gold `#c9b138`–`#e5bd6f`; flag `#8b232d`; borders + focus tokens in `:root` |
| Typography | Gotham Black (display), Gotham (body), Retro Signature (script flourishes) — `/public/fonts/` |
| Spacing / radius conventions | `--space-1`…`--space-24`; `--radius-sm/md/lg/pill`; type scale `--scale-xs`…`--scale-4xl` |
| Component library | Custom + Radix Dialog; feature components under `components/*` |
| Icon set | Project-local / inline (no dominant third-party icon kit mandated) |
| Motion language | CSS/tiny reveal (`Reveal`, `Stagger`, `FadeIn*`) + `--motion-*` / `--ease-out`; Framer Motion removed; reduced-motion safe |
| Accessibility target | WCAG 2.2 AA (SRS); contrast fixes documented in `docs/07-qa-audit-report.md` |

---

## 5. Engineering Standards

*Should match `pulse-engineering-framework` unless documented below.*

| Convention | Project standard |
|---|---|
| File / component naming | kebab/route folders; PascalCase React components; `lib/` domain modules |
| Branch naming | Prefer `feature/`, `bugfix/`, `hotfix/`, `release/` (Pulse); historically direct `main` delivery |
| Commit style | Imperative sentences on `main` (e.g. “Ship full SEO program…”); adopt Conventional Commits for new Pulse work where practical |
| PR / review process | GitHub Actions CI; production deploy via `workflow_dispatch` + environment approval |
| Env var naming | `NEXT_PUBLIC_*` for browser; server secrets without prefix; see `docs/ENVIRONMENT_VARIABLES.md` |
| Testing expectations | `pnpm test:unit`, `pnpm typecheck`, `pnpm lint`; e2e against real base URL; SEO CI scripts |
| Documentation location | `dime-enterprise-commerce/docs/` (sprint history, ops, SEO); workspace `docs/pems.md` |

**Exceptions to PSEF:** Legacy DevOS doc numbering (`00`–`46`) retained; demo-auth path for local/dev without Supabase.

---

## 6. Project Decisions

| Date | Decision | Reasoning | Alternatives considered | Impact |
|---|---|---|---|---|
| 2026-07-20 | D1–D7 locked (CA/MA, 21+, seller of record, Paybis BTC, wholesale Phase 2) | Owner baseline for MVP | Multi-state / multi-vendor / card rails | Shapes inventory, checkout, compliance |
| 2026-07–08 | Cookie/session persistence as MVP accelerator | Ship soft-launch faster | Full DB from day one | Soft-launch debt D-01–D-14; closed Sprints 10–13 |
| 2026-08-01 | Sprint 15 complete — adapters, loyalty redeem, affiliate payouts, load test, cutover docs | Exit soft-launch engineering | Rebuild rewards in-house | Production package ready; DNS owner-gated |
| 2026-08-02+ | SEO+GEO program on `.us` storefront | Capture brand/commercial intent; AI citation readiness | Rely only on `.com` brand site | Content, schema, CI audits, CWV backlog |
| 2026-08-04 | PEMS initialized under Pulse MTD | Persistent engineering memory for specialists | Ad-hoc rediscovery | Specialists read this before work |
| 2026-08-04 | Checkout shipping opened worldwide | Owner request — ship outside CA/MA | Keep CA/MA-only ship-to | Address/country validation + retail/wholesale checkout gates; catalog/tax still use age-gate jurisdiction |
| 2026-08-04 | Mobile UX optimization pass (EXA + Full Stack) | Reduce purchase friction on phone; align touch targets / safe areas | Desktop-only tweaks | Sticky PDP ATC, shop rails, checkout order summary first on mobile, left sheet menu, iOS zoom-safe inputs |
| 2026-08-04 | Mobile UX pass 2 — home / age-gate / account | Same friction goals on remaining high-traffic surfaces | Leave as-is | Edge-bleed product rails; fullscreen age gate with sticky CTAs; sticky account nav + tappable overview |
| 2026-08-04 | Migration `0012_worldwide_shipping` — denormalized ship/tax columns + country_tax_rates + shipping_rates setting | Persist worldwide checkout economics in Supabase | JSONB-only payload | Apply `db/migrations/0012_worldwide_shipping.sql` on Supabase |
| 2026-08-07 | Age-gate entry popup disabled | Owner request — remove gate from beginning of visit | Keep 21+ dialog | `getAgeGateState` always verified; `AgeGateDialog` no-op; restore path documented in component |
| 2026-08-07 | Cookie consent banner disabled | Owner request — remove bottom Accept cookies banner | Keep banner until decided | `CookieBanner` / `CookieBannerHost` no-op; `/cookies` prefs still available |
| 2026-08-07 | Storefront motion → CSS / tiny reveal; remove Framer Motion | Match TG-style snappy nav + lower JS weight | Keep Framer for entrances | `components/motion` uses IO + CSS; hero RSC; gallery CSS fade; `framer-motion` dropped |
| 2026-08-07 | Storefront chrome → RSC route group | Client `StorefrontChrome` pulled header/footer into client graph | Pathname client gate in root | `app/(storefront)/layout.tsx` + SiteHeader/Footer; admin outside group |
| 2026-08-07 | Lazy-load cart drawer + header search | Default chrome was shipping Radix drawer + suggest UI on every page | Keep eager forever | `next/dynamic` + prefetch on hover/focus; panel split to `header-search-panel.tsx` |
| 2026-08-07 | Mobile menu → CSS drawer (drop Radix) | Eager header was pulling `@radix-ui/react-dialog` for hamburger | Keep Radix Dialog for menu | `MobileNav` state + CSS `drawer-panel-left`; cart drawer still Radix (lazy) |
| 2026-08-07 | Drop `next-themes` tree provider | Full-app client ThemeProvider + React 19 peer mismatch | Keep next-themes | `data-theme` boot script + tiny `ThemeToggle`; storage key `theme` preserved |
| 2026-08-07 | Single mobile nav (drop hamburger) | Two mobile nav islands hydrated on every page | Keep both bars | Bottom bar: Home/Shop/Cart/Account/More; More sheet holds secondary links; deleted `mobile-nav.tsx` |
| 2026-08-07 | Soft-nav `loading.tsx` coverage | Marketing routes felt blank between navigations | Only shop/cart/product loaders | Thin catch-all + home/account/checkout/wishlist/wholesale skeletons; chrome stays in RSC layout |
| 2026-08-07 | Age-gate browse I/O fast path | Gate UI off but pages still paid cookie/settings + dead dialog trees | Keep always-on getAgeGateState everywhere | `AGE_GATE_ENTRY_ENABLED` flag; `cache(getAgeGateState)`; no settings read without jurisdiction cookie; home skips gate entirely |
| 2026-08-07 | Defer non-critical root clients | PWA + no-op cookie/age stubs on critical path | Eager PwaClient in root | `PwaHost` idle + dynamic; `CookieBannerHost` unmounted; age-gate UI dynamic-import only when flag on |
| 2026-08-07 | Defer homepage category + awards carousels | Below-fold autoplay/drag JS on every home visit | Eager client carousels | Static CSS snap / first-frame shells; `LazyWhenVisible` + `next/dynamic`; shared tile/gallery data modules |
| 2026-08-07 | Keep GA behind consent; no eager trackers | Audit #10 — consent already gated host; avoid expanding hop-level trackers | Always-on gtag / event islands | `AnalyticsWhenConsented`; checkout `analyticsEnabled`; dynamic route/outbound trackers; gtag `lazyOnload` |
| 2026-08-18 | Theme boot IIFE + PWA static cache | Live `error.tsx` on mobile; every page threw `(!fn)()` as `false()` | Keep bang-IIFE; cache-first `/_next` | Valid `(function(){})()` boot; SW `dime-pwa-v2` skips `/_next`; toast error boundary |
| 2026-08-18 | Keyword-gap URLs + ranking SKU metadata | GSC/Ahrefs queries ranked with no dedicated URL (signature vs balanced, heat settings, dime disposable, gummies, NY) and SKU names ranked 1–3 with thin titles | New flower SKUs / duplicate flavor posts | `KEYWORD_GAP_POSTS_2026` + `STRAIN_SEO_SLUGS` titles `{flavor} DIME`; no invented catalog |
| 2026-08-18 | Fail-fast catalog/CMS for shop HTML | Live /shop stuck on loading.tsx; home ~5s cold; Postgres could hang past connect_timeout | Wait on full DB or keep 8s CMS seed on HTML | `withTimeout` 2.5–3s → seed; parallel catalog SQL; `statement_timeout 4s`; SW v3 8s navigate abort |

---

## 7. Known Constraints

| Type | Constraint |
|---|---|
| Budget / timeline | Owner-gated DNS/secrets final step; engineering package treated complete through Sprint 15 |
| Technical | Paybis BTC-only at launch; COA/Rewards/Assistant depend on external hosts; Next 15 + Sentry Edge quirks already patched |
| Business | Platform assumed licensed seller of record (D3) — legal confirmation remains business-owned |
| Legal / compliance | Age-gate popup currently disabled (owner 2026-08-07); catalog still CA/MA jurisdiction-aware; shipping addresses accepted worldwide (owner policy); cannabis advertising/SEO compliance; noindex on cart/checkout/admin |
| Other | Brand site `dimeindustries.com` still competes for organic brand SERPs |

---

## 8. Active Work

| Field | Value |
|---|---|
| Current sprint / milestone | Production cutover + SEO Phase 1 execution / CWV remediation |
| Open tasks | Owner: DNS A/CNAME + Vercel Domains + `NEXT_PUBLIC_APP_URL`; Eng: LCP/CLS, age-gate HTML for crawlers, fact-check dime-roll content, GSC/GA4 wiring, www/apex redirects; **UX:** optional a11y/pass QA on sticky ATC + bottom-nav stacking |
| Blocked tasks | Full custom-domain TLS/smoke until owner publishes DNS (docs as of 2026-08-01; SEO probes later referenced `www.dimeindustries.us` — re-verify with `cutover:verify:once`) |
| Technical debt (active) | Thin age-gate HTML for bots; e2e breadth; possible cookie leftovers when DB off; Lighthouse budgets failing on home LCP/CLS |

---

## 9. Reusable Assets

| Asset | Path / location | Notes |
|---|---|---|
| Components | `components/ui`, `shared`, `catalog`, `cart`, `checkout`, `home`, `motion`, `seo`, … | Feature-aligned |
| Hooks / libs | `lib/auth`, `catalog`, `cart`, `checkout`, `payments`, `integrations`, `seo`, `security` | Domain modules |
| Services / utilities | `lib/db`, repositories, `scripts/*` | Seed, catalog import, smoke, SEO audit, cutover verify |
| Templates / scripts | `docs/seo/*`, GitHub workflows, `db/migrations` | Ops + growth |

---

## 10. Risk Register

| Risk | Category | Severity | Mitigation | Status |
|---|---|---|---|---|
| Custom domain DNS/TLS not fully owned/verified | Deployment | Critical | `docs/46-cutover-owner-actions.md`; `cutover:verify` | Open (owner) |
| Age gate yields thin crawler HTML on catalog/PDP | SEO / Business | High | Compliance-preserving prerender or verified-bot strategy | Open |
| Home LCP ~3.6s / CLS ~0.15 miss budgets | Performance | High | Image/hero optimization, font strategy, layout stability | Open |
| `.com` brand cannibalizes `.us` storefront SEO | Business / SEO | High | Canonical strategy, internal linking, eventual `.com` role clarity | Open |
| Incorrect “dimes in a roll” factual content | Business / SEO | Critical (content) | Fix before ranking push (SEO §0) | Open |
| Cannabis legal exposure if seller-of-record assumption wrong | Legal / Business | High | Owner legal confirmation; architecture already D3-locked | Accepted (business) |
| Live Paybis without webhook secret / misconfig | Security | High | Production guards; mock when keys absent | Mitigated |
| Demo auth enabled in production | Security | Critical | Fail-closed unless `ALLOW_DEMO_AUTH` | Mitigated |
| External COA/Assistant/Rewards downtime | Technical | Medium | Adapters + mock/`off` fallbacks | Mitigated |
| Inventory race under load | Performance | Medium | Reservation path (D-14); load script D-24 | Mitigated |

---

## 11. Improvement Backlog

| Idea | Area | Priority | Notes |
|---|---|---|---|
| Hit LCP/CLS budgets on home + landers | Performance | P0 | SEO §0 CWV baseline |
| Fix dime-roll fact + content QA | SEO / Content | P0 | SERP vs blog mismatch |
| www ↔ apex redirect + GSC property | SEO | P0 | Canonical consolidation |
| Age-gate crawl strategy without weakening compliance | SEO / A11y | P1 | High SEO finding |
| GA4 + GSC verification | Analytics | P1 | Owner + eng |
| Expand Playwright critical paths (wholesale, admin, returns) | Architecture / QA | P1 | Partial e2e today |
| Card / ACH payment rails beyond BTC | Architecture | P2 | Post-Paybis-only |
| Additional jurisdictions as config | Architecture | P2 | Gating already designed for expansion |
| Multi-vendor marketplace | Architecture | P2 | Schema vendor-ready; not built |
| Dedicated accessibility sprint beyond contrast | A11y | P2 | AA target holds; no recent a11y sprint |

---

## 12. Collaboration Notes

| Note | Detail |
|---|---|
| Assumptions | D1–D7 still owner baseline; production should not enable demo auth; `ORDERS_PERSISTENCE=auto` with migrations `0004`–`0011` applied for full commerce |
| Cross-team decisions | Wholesale delivered as Phase 2 in-product; Rewards on-site loyalty is source of truth with legacy SPA link |
| External dependencies | Supabase project, Vercel projects (staging/production), Paybis, Resend, Sentry, DIME COA/Assistant Heroku hosts, registrar DNS |
| Specialist handoffs | **CPA/DSRA** — cutover/DNS/observability; **EQTA** — CWV + e2e expansion; **ECSA** — payment/webhook/secrets review at live Paybis; **BXA/EXA** — age-gate UX vs SEO; **Full Stack** — performance + content fixes; **MTD** — re-verify domain status after owner “DNS published” |

---

## Update Checklist

Update this record when any of the following change:

- [x] Architecture — initial discovery recorded
- [x] Technology / major dependencies — profiled from `package.json` + docs
- [x] Design system — tokens from `globals.css`
- [x] Security model — auth roles, headers, demo-auth guards noted
- [x] Deployment / hosting — Vercel + cutover status
- [x] Significant feature completed — Sprints 1–15 + SEO program snapshot
- [x] Major technical decision made — D1–D7 + PEMS init (2026-08-04)
