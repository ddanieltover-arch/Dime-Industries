# DIME Enterprise Commerce Platform
## Frontend Mode — Page 1: Home

**Status:** Complete, self-QA passed. Awaiting your approval before Page 2.

---

## Design plan

Reference-site research (Website Analysis Mode) established that DIME's actual public identity is built on lab-tested transparency — COAs, batch numbers, cannabinoid percentages — not on generic cannabis-brand styling. So rather than defaulting to the near-black-background-plus-acid-green look that AI-generated cannabis sites cluster around, the whole page is built around the object that transparency already lives on: **a certificate**.

- **Color** — warm parchment paper as the default surface (`#F3ECDD` bg / `#FFFCF5` card), cured-resin amber as the primary accent (`#B5651D`, the actual color of live resin — not a stock "cannabis green"), a desaturated moss for the secondary accent (`#5F7052`, deliberately not neon), ink-charcoal text with a walnut tint rather than pure black. Dark mode (`#17130E` bg / `#E39A4C` accent) is explicitly "the same certificate under amber light," not a second design language.
- **Type** — Fraunces (a characterful serif) for display, Inter for body, IBM Plex Mono reserved *only* for anything that reads like lab data — batch IDs, percentages, SKUs — so those numbers always look like they came off a real certificate rather than blending into marketing copy.
- **Signature element** — the hero is literally styled as an oversized lab ticket: a monospace metadata stub (batch/tested-date/lab), a perforated tear-line, and a real potency readout (animated THC/CBD/CBN bars, not a decorative stat block). The same structural device — potency always visible, ticket-like card edges — repeats on every product card, so it's a running motif, not a one-off hero flourish.

**Self-critique performed before building:** the first instinct for a cannabis brand is near-black + green, which is exactly the flagged generic pattern — swapped for the parchment/amber "certificate" direction instead, and made dark mode a lighting change on the same idea rather than a different palette.

## Pages/sections built

Home (`/`): age/jurisdiction gate → hero → trust/compliance strip → per-line product rails (Live Reserve, Signature) → store locator teaser → newsletter signup. Root layout (fonts, theme provider, header, footer) also shipped since every page depends on it.

## Coverage against your checklist

| Requirement | How it's addressed |
|---|---|
| **Design** | Original "lab ticket" system above — not the reference sites' actual CSS/assets, an original design built from the same subject matter |
| **Components** | 13 components: header, footer, theme provider/toggle, age-gate dialog, hero, trust strip, product card, product rail, store locator teaser, newsletter signup |
| **Accessibility** | Skip link; `aria-label`/`aria-labelledby` on every nav/section; age gate uses Radix Dialog (real focus trap, `aria-describedby`, `Escape`/outside-click deliberately disabled since it's a legal control, not a dismissible popup); visible focus ring globally; `prefers-reduced-motion` respected both in CSS and in every Framer Motion variant; theme toggle has `aria-pressed` |
| **SEO** | Per-page `metadata` export (title/description/canonical), Open Graph + Twitter card at the layout level, Organization JSON-LD |
| **Animations** | Staggered hero entrance, animated potency bars, age-gate step transitions — all gated behind `useReducedMotion()`, not just the global CSS media query, so JS-driven animation actually stops too |
| **Responsive layout** | Mobile-first Tailwind classes throughout; separate mobile nav strip vs. desktop nav; ticket layout collapses from two-column to stacked below `md` |
| **Dark mode** | `next-themes` + CSS variables, light (parchment) is default, full dark variant defined, toggle in the header |
| **Loading states** | Route-level `loading.tsx` skeleton matching actual layout shape, plus a per-component pending state on the newsletter form |
| **Error states** | Route-level `error.tsx` boundary with retry, plus inline form error states (age gate, newsletter) that are honest about what happened rather than generic |
| **Testing** | 5 Vitest unit tests (all passing, see below) + a 7-case Playwright e2e spec (age gate, theme toggle, nav, skip link) — written but not executed, see note below |

## Self-QA actually performed (not just read-through)

Same standard as Backend Phase 1: real tooling, not eyeballing.

- **Full TypeScript compile** against the real dependencies (`next`, `react` 19, `@radix-ui/react-dialog`, `framer-motion`, `next-themes`, `zod`) — clean after fixes.
- **5 Vitest unit tests, actually executed, all passing.**

**Bugs found and fixed before you saw this code:**

1. **A real compliance gap, not a cosmetic one.** The first draft fetched and rendered the full product catalog on every request and relied on the age-gate dialog to visually cover it. That means actual product names and prices would have been sent to an unverified visitor's browser — recoverable from page source regardless of whether the modal was showing. Rewrote `page.tsx` so product data is only fetched at all once the age-gate cookie is confirmed server-side; an unverified request gets a neutral skeleton block, never real content.
2. **Framer Motion `Easing` typing** — a bezier array typed as plain `number[]` doesn't satisfy Framer Motion's `Variants` type; `tsc` caught it. Fixed with `as const` tuples and `satisfies Variants`.
3. **Missing test cleanup between cases** — the second Vitest test failed with "multiple elements found" because React Testing Library doesn't auto-unmount between tests under Vitest the way it does under Jest; the first test's render was still in the DOM when the second ran. Added explicit `afterEach(cleanup)`.
4. **`server-only` import failing under Vitest** — that package always throws when actually executed; it only becomes a no-op through Next.js's own webpack aliasing at build time, which Vitest doesn't run through. Added the same alias Next.js uses, in `vitest.config.ts`, rather than removing the `server-only` guard from the source (removing it would have quietly reopened the door to accidentally importing a server-only module from a Client Component later).

**Confirmed correct, no changes:**
- Age gate correctly refuses to close on `Escape` or outside click — a legal gate isn't a dismissible popup.
- Jurisdiction selection outside CA/MA shows an honest "not yet available" message rather than silently redirecting.
- Newsletter subscribe deliberately does **not** write to the database directly — there's no `newsletter_subscribers` table in the schema Database Mode shipped, and adding one here would have bypassed that process. Left as a clearly marked `TODO` for the Integrations phase instead.

**Not executed, flagged honestly:** the Playwright e2e spec is written to the same standard as the rest of this phase but wasn't run — there's no live Next.js dev server or browser binaries in this environment. It's the natural first thing to wire into the CI pipeline (`Playwright E2E` step) once a real dev server exists.

**Two known dependencies on work not yet built**, both commented in the code itself: `lib/data/products.ts` is static placeholder data shaped exactly like the real schema, swappable for a real fetch once the Catalog Service (Backend Phase 2) ships; the newsletter action is a stub pending the Integrations phase.

---

**Status: Page 1 (Home) complete, self-QA passed. Awaiting your approval before Page 2.**
