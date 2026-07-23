# Sprint 3 Progress Report — Checkout & Paybis BTC

**Date:** 2026-07-20  
**Status:** Implementation complete — awaiting owner review / Sprint 3 exit approval  
**Payment mode:** Mock when `PAYBIS_*` unset; live adapter ready when keys present

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Pricing | `lib/checkout/pricing.ts` — CA/MA tax + flat/free shipping |
| Orders | Cookie order jar + create/update/mark paid |
| Payments | `PaymentProvider` + Paybis adapter (live + mock) |
| Checkout UI | `/checkout`, mock pay, confirmation receipt |
| Webhook | `POST /api/webhooks/paybis` (signature verify; DB persist deferred) |
| Cart | CTA → checkout; drawer Checkout button |
| Env | `.env.example` updated for Paybis + `NEXT_PUBLIC_APP_URL` |
| QA | Unit tests for pricing, schema, Paybis mock/webhook |

## Honest limitations (tracked, not hidden)

1. **Orders are cookie-scoped** until Drizzle order writes land — live Paybis webhooks verify but cannot mutate the shopper cookie jar across servers.
2. **Resend order email** not sent yet (confirmation page notes intent).
3. **Inventory reservation queue** not built — soft max-qty check only.
4. **Guest checkout via email** (no forced login page yet; account history is Sprint 4).

## Recommendation

Approve Sprint 3 exit and authorize **Sprint 4 — Customer Dashboard** (orders list, profile, addresses, wire confirmation emails).

## Next milestone

**Sprint 4:** Customer portal — order history from persisted orders, profile/addresses, notification prefs, product validation entry, Resend order confirmation.
