# DIME Enterprise Commerce Platform
## Reference Site Research + Software Requirements Specification (v1.0)

**Mode:** Research Mode → Website Analysis Mode → SRS deliverable
**Status:** Awaiting approval before Architect Mode begins
**Scope of this document:** research findings and requirements only — no application code, no architecture, no database schema. Those come next, after sign-off.

---

## Part 1 — Reference Site Research & UX/UI Audit

### Methodology

Live content was pulled from `dimeindustries.com` (homepage + vapes catalog page) and `eaze.com/brands/dime`. `rollingreleaf.com` blocks automated fetching via robots.txt, so its patterns below are reconstructed from indexed search snippets of its DIME brand page, vapes category page, and general delivery pages — treat those specifics as directionally accurate rather than pixel-verified. All three are licensed cannabis commerce properties (dimeindustries.com displays CA distribution/manufacturing license numbers; Eaze and Rolling Releaf are licensed delivery marketplaces).

### Site 1: dimeindustries.com — brand site, not a checkout-capable store

**What it is:** A WordPress/Bricks-built brand marketing site, not a transactional storefront. There is no cart or checkout anywhere on it.

- **Nav:** Find Dime (store locator, events, locations) · Products (with Hemp/CBD and Merch as separate sub-brands/domains) · Promotions · Rewards Login (external subdomain) · Wholesale · DIME App · an "AI Assistant" (budtender) · Contact · About · Lab Results (COAs, on a separate Heroku-hosted app) · FAQ.
- **Homepage:** full-bleed hero video, age gate (21+ / medical patient confirmation) before any content renders, product spotlight tiles linking into specific SKUs, a store-locator embed (StoreRocket), a "Validate Your Products" section (anti-counterfeit / warranty registration tied to app rewards), and a gated newsletter signup.
- **Catalog structure:** Products are organized into named **lines** (Signature, Live Reserve, Balanced, Rosin, State Exclusive, Collaborations), each a horizontally-scrolling rail of SKU tiles on the vapes hub page, with "VIEW ALL" per line. Footer nav collapses categories to Vapes / Edibles / Prerolls / Batteries.
- **Fragmentation:** Lab results, the AI budtender, and the loyalty/rewards program each live on a *different* subdomain/host (two on Heroku, one on a `rewards.` subdomain) — a real UX seam: the user leaves the primary site and its design system every time they check a COA or their points balance.
- **Compliance surface:** age gate on entry, license numbers in the footer, "Adult and Medical" distinction, separate Medical Privacy Policy from the general Privacy Policy.

**Takeaway:** this is the brand/marketing layer, not the commerce layer. Its main lessons for us are taxonomy (product lines as a merchandising concept distinct from category), the age-gate pattern, and the compliance/legal footer conventions — not checkout UX.

### Site 2: eaze.com/brands/dime — licensed delivery marketplace, brand shelf page

- **Brand page layout:** brand logo + truncated brand story ("See more" expansion) at top, then a **faceted filter sidebar** (Potency: Low/High/Very High: Strain Type: Hybrid/Indica/Sativa/No Species; Category: Accessories/Vaporizers; Subcategory: All-In-One/Battery/Universal Cartridge), then a result-count-labeled grid ("Showing 58 results").
- **Product card:** thumbnail, strain type badge, weight (1g/2g), product name, THC% and CBD% displayed inline on the card itself (not hidden behind a click), price. This is a meaningfully different information density than a typical e-commerce card — potency is treated as a first-class, always-visible attribute, the way size or color would be for apparel.
- **SEO/content layer:** a brand FAQ block at the bottom of the page ("Is DIME a good brand?", "Is DIME strong?", "Does DIME have good vaporizers?") written for both users and search — answers reference the actual product range and THC/CBD spread pulled from the catalog.
- **Cross-linking footer:** top cities (city-specific delivery landing pages — clear local-SEO play), top brands, top categories — all as internal links, not just a sitemap dump.
- **Global nav (site-level, not brand-page-level):** Sign Up / Log In / Support / Contact — standard marketplace auth pattern.

**Takeaway:** Eaze is the clearest model for what a real DIME *storefront* (as opposed to brand site) should feel like — potency-forward product cards, strain/potency/subcategory faceting, and locality as an SEO surface via per-city landing pages.

### Site 3: rollingreleaf.com — regional delivery marketplace (Boston area), cart-capable

- **Brand/category pages:** faceted filters again, but centered on **quantity/weight variants and strain type** rather than potency bands (1 each / 1g / 2g / 5g; Sativa/Indica/Hybrid/Sativa-Dominant/Indica-Dominant). Multi-variant products show "Choose an option" rather than a single price — i.e., variant selection happens at the card level in the grid, not only on a product detail page.
- **Cart pattern:** "Add to Cart" is present directly on grid cards for single-variant products; multi-variant products route to "Select Options" first. This is the classic WooCommerce variable-product pattern.
- **Trust/differentiation messaging:** "No Hidden Fees, No Surprises — what you see is what you pay," real-time delivery tracking, multiple payment options called out explicitly (Apple Pay, cash, debit, credit), and a "Social Equity certified" badge tied to local licensing.
- **Merchandising:** rotating daily deals, bundle promos ("5 vapes for $110"), and loyalty mechanics (raffle entries for spend thresholds) surfaced directly on category/deal pages, not tucked into a separate loyalty tab.
- **Legal footer:** an explicit "Nothing for sale. For educational purposes only. Must be 21+" style disclaimer pattern common to state-licensed delivery platforms (menu ≠ direct sale in some jurisdictions' framing — worth checking against wherever DIME Enterprise Commerce actually operates).

**Takeaway:** Rolling Releaf is the best model for cart/checkout mechanics and for how a delivery-style cannabis storefront handles trust and fee transparency — both currently missing from the DIME brand site entirely.

### Cross-site synthesis

**Strengths worth adopting:**
- Potency (THC/CBD/CBN%) as an always-visible product attribute, not a detail-page afterthought (Eaze).
- Product "lines" as a merchandising layer above category (dimeindustries.com) — useful for a brand-forward experience once DIME sells direct.
- Variant selection at the grid level for quantity/format (Rolling Releaf) — reduces clicks to cart for the common case.
- Fee transparency and delivery-tracking trust signals stated explicitly, not implied (Rolling Releaf).
- City/locality as an SEO surface (Eaze) — directly reusable for a platform with jurisdiction-aware availability anyway.
- Brand-level SEO FAQ blocks that pull live catalog stats into the copy (Eaze).

**Weaknesses / gaps to fix, not repeat:**
- dimeindustries.com has **no actual checkout** — rewards, lab results, and the AI assistant all live off-domain, breaking continuity. DIME Enterprise Commerce should keep lab results (COAs), loyalty, and support inside one design system and one session.
- None of the three reference sites appear to expose wishlist, recently-viewed, or related-product logic in what we could inspect — real gaps versus general e-commerce norms, and an easy place for DIME Enterprise Commerce to differentiate.
- Faceting vocabulary is inconsistent across the three (potency bands vs. strain type vs. weight/format) — worth designing one coherent filter taxonomy up front rather than cloning any single site's.
- No visible wholesale UX on any of the three public-facing sites (dimeindustries.com links to a Wholesale page but its contents weren't in scope here) — this is a genuine build-from-scratch area, not an adapt-from-reference one.

### Improvement recommendations (beyond replication)

Per the skill's "don't just replicate — improve" requirement, on top of what's above: advanced search + autocomplete, wishlist, recently viewed, related/bundle products, reviews & ratings, a unified loyalty + affiliate program (not off-domain), dynamic coupons, real inventory tracking, order tracking, a returns/refund workflow, and a real CMS/blog/homepage-builder so merchandising doesn't require a redeploy. Full list is in the skill's project brief reference.

---

## Part 2 — Software Requirements Specification

### 1. Introduction

**1.1 Purpose.** This SRS defines the functional and non-functional requirements for the DIME Enterprise Commerce Platform: a production-ready, enterprise-grade cannabis marketplace supporting retail and wholesale purchasing, built to serve 100,000+ users, inspired by (but not copying code or creative assets from) dimeindustries.com, eaze.com/brands/dime, and rollingreleaf.com.

**1.2 Scope.** In scope: guest browsing, registered-customer retail purchasing, wholesale-buyer purchasing, an admin back office, a CMS, and the compliance controls needed to operate legally across jurisdictions. Explicitly out of scope for this phase: implementation code, database schema, and architecture diagrams — those are Architect Mode deliverables, gated on approval of this document.

**1.3 Definitions.** *COA* — Certificate of Analysis (lab test result). *SKU* — a specific purchasable product/variant. *RLS* — row-level security (Postgres). *AIO* — all-in-one vape device (disposable). *Jurisdiction gating* — restricting product visibility/purchasability by the buyer's verified legal jurisdiction.

### 2. Overall description

**2.1 Product perspective.** A greenfield, standalone e-commerce platform — not an extension of the existing dimeindustries.com WordPress site. It will eventually support multi-vendor (marketplace) operation, so today's single-brand build must not assume a single-seller data model.

**2.2 User classes and characteristics.**
- **Guest visitor** — browses, filters, must pass age verification before viewing product detail/pricing; cannot check out without registering (standard for age-restricted commerce).
- **Registered customer (retail)** — full account: orders, wishlist, addresses, loyalty, affiliate, returns.
- **Wholesale buyer** — sees wholesale pricing/minimums, tax-exempt/resale documentation flow, distinct catalog view; likely NET-terms or B2B payment considerations to clarify with the user before Architect Mode.
- **Administrator** — full back-office access: catalog, inventory, orders, customers, CMS, reviews moderation, coupons, analytics, settings, audit logs.
- **(Future, not built now) Vendor** — the data model must not preclude adding this role later.

**2.3 Operating environment.** Web application, responsive across mobile/tablet/desktop, deployed on Vercel, targeting current evergreen browsers.

**2.4 Constraints.** Cannabis products may only be sold where legally permitted — the platform must support configurable, jurisdiction-aware product visibility and age verification from day one, not as a retrofit. Payment processing is constrained by the cannabis industry's limited access to traditional card rails; primary payment method is Paybis (BTC) behind a swappable payment abstraction.

**2.5 Assumptions and dependencies.** Assumes the user (or the actual DIME legal/compliance team) will supply the authoritative list of which jurisdictions are currently permitted and what age/ID verification standard applies in each — this SRS defines the *capability* (configurable jurisdiction gating), not the specific jurisdiction list, which is a legal/business decision outside engineering's scope.

### 3. System features (functional requirements)

**3.1 Age & jurisdiction gating.** The system shall block access to product pricing/purchase flows until the visitor confirms 21+ (or qualifying medical status) and the system shall determine or collect the visitor's jurisdiction and hide/disable products not legally sellable there. Configurable per-jurisdiction rules, administrable without a code change.

**3.2 Catalog & merchandising.** Products belong to a Category (Vapes/Edibles/Prerolls/Accessories) and optionally a merchandising Line (e.g. Signature/Live Reserve/Rosin — a DIME-specific concept worth keeping) and have Variants (weight/format, e.g. 1g/2g, cartridge vs. AIO). Each SKU carries potency metadata (THC%/CBD%/CBN% etc.) as first-class, filterable, always-displayed-on-card attributes per the Eaze pattern above. Strain type (Sativa/Indica/Hybrid) is a filterable facet.

**3.3 Search, filtering, discovery.** Full-text search with autocomplete. Faceted filtering on category, line, strain type, potency band, weight/format, price. Sort by price/potency/popularity/newest. Wishlist, recently-viewed, and related/bundle product surfacing (identified gap vs. all three references — a differentiation opportunity).

**3.4 Cart & checkout.** Grid-level "Add to Cart" for single-variant SKUs; "Select Options" flow for multi-variant SKUs (Rolling Releaf pattern) before adding. Cart persists across session for logged-in users. Checkout collects/verifies shipping address against jurisdiction rules, applies coupons, computes tax, and settles via the payment abstraction (Paybis BTC at launch). Explicit, itemized fee transparency at every step (no hidden fees, per the Rolling Releaf trust pattern) — order summary must show every charge before the buyer commits.

**3.5 Customer accounts.** Order history + status/tracking, addresses, profile, notifications preferences, wishlist, loyalty balance/history, affiliate dashboard, returns initiation — all inside the platform's own design system (fixing the dimeindustries.com off-domain fragmentation problem).

**3.6 Wholesale.** Separate wholesale pricing tier and minimum-order-quantity rules, a wholesale-buyer application/verification flow, and a distinct wholesale catalog/order view. Needs a follow-up conversation with the user on payment terms (NET-30 etc.) before Architect Mode designs the data model.

**3.7 Reviews & ratings.** Verified-purchase reviews with a moderation queue in the admin panel.

**3.8 Loyalty & affiliate programs.** Points-earning and redemption for loyalty; referral tracking and payout tracking for affiliate — both native to the platform, not a bolted-on third-party widget requiring a separate login.

**3.9 Coupons & promotions.** Admin-configurable dynamic coupons (percentage/fixed/BOGO), scheduled promotions, and deal/bundle merchandising surfaced directly on category pages (Rolling Releaf pattern), not hidden in a separate promotions tab only.

**3.10 CMS & content.** Blog, homepage builder, banner management, FAQ management (including auto-generated brand/category FAQ blocks that pull live catalog stats, per the Eaze pattern) — all admin-editable without a deploy.

**3.11 Compliance & product safety.** COA/lab-result display per SKU, inline in the platform (not off-domain), plus a product validation/anti-counterfeit registration flow analogous to dimeindustries.com's "Validate Your Products," tied into the loyalty system.

**3.12 Admin dashboard.** Full CRUD over products/categories/inventory/orders/customers/reviews/coupons/CMS, plus analytics, sales reporting, settings, and audit logs.

**3.13 Notifications & email.** Transactional email for account, order, and marketing lifecycle events (full list in the skill's reference material) via Resend.

**3.14 Store/dispensary locator.** Retain the store-locator concept from dimeindustries.com for markets where DIME sells through third-party retail as well as direct.

### 4. External interface requirements

**4.1 User interfaces.** Responsive web UI; component-driven design system (buttons, forms, cards, tables, dialogs, nav, pagination, toasts, skeleton loaders, empty/error states) — shared across storefront, customer portal, and admin, so nothing repeats the "different subdomain, different look" problem seen on the reference site.

**4.2 Software interfaces.** Payment gateway (Paybis, behind an abstraction), email delivery (Resend), maps (OpenStreetMap for store locator / delivery zones), authentication provider (Supabase Auth — email + Google), object storage (Supabase Storage), error monitoring (Sentry), analytics (Vercel Analytics).

**4.3 Communication interfaces.** HTTPS only; webhooks from the payment provider for order status updates.

### 5. Non-functional requirements

Performance, accessibility, security, and SEO targets are as defined in the skill's non-functional targets (Lighthouse ≥95 across the board, LCP < 2.5s, FCP < 1.8s, TTI < 3s, API P95 < 300ms, 99.9% uptime, WCAG 2.2 AA). At 100,000+ users the design must account for: read-heavy catalog traffic (cacheable, CDN-friendly product/category pages), write contention on inventory during high-demand drops, and session/cart durability across a horizontally-scaled deployment — these become explicit constraints for Architect Mode, not just aspirational numbers.

### 6. Data requirements (pointer only)

Entity-level detail (Users, Products, Variants, Inventory, Orders, Coupons, Reviews, Loyalty, Affiliate Accounts, CMS Pages, Audit Logs, etc.) is intentionally deferred to Architect Mode / Database Mode — this SRS establishes *what* must be modeled (section 3 above), not the schema itself.

### 7. Compliance & legal requirements

Age verification (21+ / qualifying medical patient) before any pricing or purchase interaction. Jurisdiction-aware product visibility, configurable by an administrator without a deploy. License number(s) displayed in the footer per the reference-site convention. Separate general vs. medical privacy policies if the platform supports medical patients. Terms of Service, Returns Policy, and a clear "must be 21+" disclaimer pattern. **This SRS defines the required capabilities; the actual list of permitted jurisdictions and their specific ID/age-verification standards must come from the user or DIME's legal/compliance function** — that's a business input, not something to infer from the reference sites.

### 8. Open questions for the user (please resolve before Architect Mode)

1. Which specific jurisdictions/states is DIME Enterprise Commerce actually launching in, and what age/ID verification standard applies in each?
2. Wholesale payment terms — NET-30/60, upfront, or gateway-processed?
3. Should the platform integrate directly with dimeindustries.com's existing COA host and rewards system, or fully replace them?
4. Multi-vendor timeline — is "don't block it later" the only requirement for now, or is there a rough date this becomes real?
5. Target initial jurisdiction(s) for the store locator / delivery zones (affects the OpenStreetMap integration scope)?

### 9. Out of scope for this phase

No application code, no database schema, no API contracts, no UI mockups have been produced in this document — per your instruction, those begin only after you approve this SRS (Architect Mode, per the skill's engineering workflow).

---

**Status: awaiting your approval to proceed to Architect Mode** (business/information architecture, database schema, API design, design system tokens).
