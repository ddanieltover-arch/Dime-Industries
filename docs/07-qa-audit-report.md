# DIME Enterprise Commerce Platform
## QA Mode — Full-Project Audit (v1.0)

**Scope note, up front:** "Production ready" for the *whole platform* isn't a claim this audit can honestly make — only two things have actually been built as code: Backend Phase 1 (auth/users/roles) and Frontend Page 1 (Home). Catalog, cart, checkout, wholesale, admin, and every other page/service exist only as architecture and database design, not code, so there's nothing to audit-and-harden there yet. What this audit does: **rigorously audits and hardens everything that exists**, and gives you an honest, itemized list of what's still required before the *platform* — not just these two pieces — is production ready.

Every fix below was actually applied and re-verified (`tsc` clean, tests re-run green) — this document isn't a plan, it's a record of what changed.

---

## Critical findings (fixed)

### 1. Privilege escalation via `orders.wholesale_account_id` — Security

`orders_owner_insert`'s RLS check validated that `user_id = auth.uid()`, but never checked that a supplied `wholesale_account_id` actually belonged to that user. Since Supabase exposes tables directly to PostgREST, **any authenticated retail customer could have crafted an order insert referencing someone else's approved wholesale account** and received wholesale pricing/terms they weren't entitled to. This is exactly the class of bug RLS is supposed to prevent, sitting in a policy that looked correct at a glance.

**Fix:** `orders_owner_insert`'s `WITH CHECK` now also requires that any non-null `wholesale_account_id` resolve to a wholesale account owned by the caller and already `approved = true`. See `db/rls_policies.sql` and `db/migrations/0003_qa_hardening.sql`.

### 2. Missing `order_items` INSERT policy — functional bug, would have blocked every checkout

`order_items` had a SELECT policy but no INSERT policy. Postgres RLS denies by default when a table has RLS enabled and no policy matches the operation — meaning **checkout using the normal authenticated client would have failed on every single order**, not just an edge case. This wouldn't have surfaced until integration testing against a real checkout flow, at which point it would have looked like a mysterious silent failure.

**Fix:** added `order_items_insert_via_order`, scoped to the same ownership rule as the parent order.

### 3. Coupon code enumeration — Security / data leak

`coupons_active_read` allowed any caller — authenticated or anonymous — to `select code from coupons` and **list every currently active promo code**, including ones never publicly advertised (targeted/influencer codes, internal test codes). This is a real leak: Supabase exposes tables directly, so "we never link to that endpoint" provides no protection.

**Fix:** the `coupons` table is now admin-only under RLS. A new `validate_coupon(p_code text)` function (SECURITY DEFINER) lets checkout confirm whether a *specific* code the caller already has is valid, without exposing the list.

---

## Other findings (fixed)

| # | Area | Finding | Fix |
|---|---|---|---|
| 4 | Accessibility | Primary CTA button text (white on `--color-resin`) measured **4.23:1** — fails WCAG AA's 4.5:1 for normal-size text. Computed precisely, not eyeballed. | Buttons now use `--color-resin-strong` as the base fill (6.60:1 light / 9.34:1 dark) with a new `--color-resin-hover` for the hover state, verified to still pass |
| 5 | Accessibility | `--color-border` (1.28:1 against the background) was also being used on form-control boundaries (select/input), which WCAG 1.4.11 requires ≥3:1 for | Added `--color-border-interactive` (3.55–4.08:1 light, 3.62–4.15:1 dark), applied to the age-gate select and newsletter input; decorative dividers/card edges correctly keep the lower-contrast `--color-border` since 1.4.11 doesn't apply to non-essential decoration |
| 6 | Database | `wholesale_accounts` had no uniqueness constraint on `user_id` — a user could submit multiple applications, creating ambiguity for which account governs their pricing/orders | Added `wholesale_accounts_user_unique` |
| 7 | Database | `orders.payment_terms` had no check constraint, and nothing tied "has payment terms" to "is a wholesale order" — a retail order could silently carry stray terms data | Added `orders_payment_terms_check` and `orders_wholesale_terms_consistency` |
| 8 | Database | Nothing prevented a user from submitting unlimited reviews for the same product | Added `reviews_product_user_unique` on `(product_id, user_id)` |
| 9 | Database | `inventory_status` view relied on Postgres's *implicit* default for whether it bypasses the underlying table's RLS — correct today, but silently version-dependent | Made explicit: `with (security_invoker = false)`, commented with why |
| 10 | Performance | Middleware matcher excluded only a few asset extensions and ran the session-refresh logic on webhook routes, which never carry a user session cookie | Broadened the exclusion list (css/js/fonts/xml/txt) and excluded `api/webhooks/*` |
| 11 | SEO | No `robots.txt` or `sitemap.xml` existed anywhere in the project | Added `app/robots.ts` (disallows `/admin`, `/account`, `/cart`, `/checkout`, `/api`) and `app/sitemap.ts` (static routes only — intentionally not wired to the catalog yet, since that API doesn't exist; wiring it now would silently break the build later) |

---

## Audit by dimension

### Architecture
Holds up on re-review. The two items flagged as open in the architecture document are still open and still matter: the **order fulfillment model** (licensed seller of record vs. routing to third-party retailers) and the **COA/Rewards API contracts** — both are business/external dependencies, not something a code audit can resolve. Nothing new to add here beyond what's already tracked.

### Performance
Nothing built yet operates at meaningful scale (mock catalog data, one page). What exists follows the right patterns: self-hosted fonts via `next/font` (no render-blocking third-party font requests), no unoptimized images yet since there are none. Fixed the middleware matcher overhead (#10). **Not yet exercised**: the queue-backed inventory decrement the Scalability Plan calls a launch requirement — can't be audited because checkout doesn't exist as code yet.

### Security
This is where the real findings were (#1–#3). Beyond those: confirmed every table has RLS enabled with no gaps (re-checked the full policy file table-by-table after the fixes). Confirmed `audit_logs` still has no client-writable path. Confirmed the service-role key stays server-only in `lib/supabase/server.ts`. Confirmed generic error messages on auth failures (no enumeration vector) are still in place from Backend Phase 1.

### Accessibility
Computed exact WCAG contrast ratios for every color-token pair in the design system (not estimated) — found and fixed #4 and #5, confirmed the other nine pairs checked all pass. Re-confirmed: focus-visible ring is global and unsuppressed, the age gate correctly disables `Escape`/outside-click dismissal (a legal control, not a dismissible popup), `prefers-reduced-motion` is respected in both CSS and every Framer Motion variant.

### SEO
Home page itself was solid (per-page metadata, JSON-LD, canonical). The gap was site-wide (#11), now closed. Sitemap is deliberately static-only for now — flagging that as a known gap to close once the Catalog Service exists, not silently working around it.

### Database
Three real integrity gaps (#6–#8) plus the defensive-clarity fix (#9). Re-checked every foreign key's cascade behavior, every check constraint, and every index against current query patterns — no further issues found on this pass.

### API
Only the auth surface exists as code (Backend Phase 1). Re-read `middleware.ts` and `app/(auth)/actions.ts` end to end: still correct, the two bugs Backend Phase 1's own self-QA already caught (async `cookies()`, the role-ladder privilege bug) stayed fixed and no regressions were introduced by this pass. The full API contract table from the architecture document remains a design artifact, not yet implemented — nothing to audit there until Backend Phase 2+.

### Code Quality
`tsc --noEmit` run clean across both `backend/` and `frontend/` after every fix in this document, not just before. Full test suites re-run: **5/5 Vitest unit tests passing**. Two testing-infrastructure bugs were caught and fixed *during this audit's own verification process* (worth naming plainly, since they're a legitimate part of what "audit the whole project" turned up): a missing `@testing-library/dom` peer dependency, and Vitest's default glob accidentally trying to collect and execute the Playwright e2e spec as if it were a Vitest suite (fixed by scoping `vitest.config.ts`'s `include` to `tests/unit/**`). A third find, this time an organizational one: **migrations had split across two directory trees** — `0002_auth_sync_trigger.sql` had been written under `backend/db/migrations/` during Backend Phase 1 while `0001` and the new `0003` lived under the top-level `db/migrations/`. Anyone trying to run migrations in order against a fresh database would have silently missed `0002`. Consolidated into one canonical `db/migrations/` directory. One code-quality note for later, not urgent: `formatPrice()` currently lives only in `product-card.tsx` — worth promoting to a shared `lib/format.ts` once checkout needs the same formatting, rather than duplicating it.

---

## What "production ready" actually requires from here

Being direct about the gap between "what's been hardened" and "a production platform," since claiming the latter right now would be overstating this audit's scope:

- **Everything past Backend Phase 1**: catalog, cart, checkout (including the inventory-decrement concurrency work the Scalability Plan requires), wholesale, admin, CMS, loyalty/affiliate, reviews, COA/Rewards integrations — all still design-only.
- **Every page past Home**: Shop, Category, Product Detail, Cart, Checkout, Account, Admin, Wholesale, Locations, Blog, legal pages.
- **The two open business questions** from the architecture document (fulfillment model, COA/Rewards API contracts) — neither is closeable by further code work.
- **A real load test** against checkout/inventory under concurrency, per the Scalability Plan's own exit criterion — impossible before checkout exists.
- **The Playwright e2e suite actually running in CI** — written, not yet executed anywhere, since there's no live environment in this sandbox.

None of that is a criticism of what's been reviewed here — Backend Phase 1 and the Home page are genuinely hardened now, with real bugs found and fixed rather than rubber-stamped. It's a scoping statement: "production ready" is a claim about the whole platform, and most of the platform doesn't exist as code yet.

---

**Status: audit complete for everything currently built. Recommend continuing with Frontend Page 2 or Backend Phase 2 next, with this same audit standard applied incrementally as each piece ships — rather than deferring all hardening to one final pass at the end.**
