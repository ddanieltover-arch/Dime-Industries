# Sprint 2 Progress Report — Cart & Wishlist

**Date:** 2026-07-20  
**Status:** Implementation complete — awaiting owner review / Sprint 2 exit approval  
**Unit tests:** cart + wishlist + catalog suites (run `pnpm test:unit`)  
**Checkout:** intentionally deferred to Sprint 3

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Cart core | `lib/cart/*` — pure logic, cookie persistence, catalog lookup |
| Cart actions | `app/(commerce)/cart-actions.ts` — add / update / remove / clear |
| Cart UI | `/cart` page, header badge + drawer, PDP add-to-cart |
| Wishlist | Cookie store + `/wishlist` + PDP toggle |
| Recently viewed | Cookie + PDP tracker + “Recently viewed” rail |
| Transparency | Cart summary shows subtotal; tax/shipping labeled for checkout |
| Docs | `docs/12-sprint-2-charter.md` |
| QA | Unit tests for cart/wishlist/recent logic; cart E2E spec |

## Storage note (accepted for Sprint 2)

Guest cart / wishlist / recent use HTTP cookies. Auth DB sync for wishlists lands when Supabase catalog reads are wired. `mergeCarts()` is implemented for post-login merge in Sprint 3/4.

## Remaining / deferred to Sprint 3

- Checkout flow + address / jurisdiction re-check
- Paybis BTC payment abstraction
- Tax / shipping calculation
- Inventory reservation
- Coupons at checkout
- Cart merge on login UI wiring

## Recommendation

Approve Sprint 2 exit and authorize **Sprint 3 — Checkout & Paybis BTC**.

## Next milestone

**Sprint 3:** Checkout steps, fee transparency with tax/shipping, Paybis integration behind payment provider interface, order confirmation email (Resend).
