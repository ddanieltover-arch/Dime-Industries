# Sprint 3 Charter — Checkout & Paybis BTC

**Status:** Active (authorized 2026-07-20)  
**Prior:** Sprint 2 exit approved  
**Exit gate:** End-to-end checkout with itemized fees + Paybis-shaped payment session (mock when keys absent)

---

## Scope (IN)

- Checkout page: contact email, shipping address, jurisdiction re-validation
- Pricing engine: subtotal + tax + shipping (itemized, no hidden fees)
- Order creation (pending → payment_confirmed)
- Payment provider interface + Paybis adapter
- Mock/sandbox completion path when `PAYBIS_*` unset (dev/staging)
- Webhook handler `POST /api/webhooks/paybis` (signature verify when secret set)
- Confirmation page + clear cart on paid
- Cart CTA → `/checkout`
- Unit tests for pricing + payment mock + webhook verification

## Scope (OUT)

- Real Paybis production credentials (business dependency)
- Resend order email (stub hook; full templates Sprint 4/6)
- Coupon application (Sprint 6)
- Inventory reservation queue (flagged; soft stock check only)
- Account order history UI (Sprint 4)

## Storage decision

Orders persist in signed HTTP cookie store for Sprint 3 (same pattern as cart) until Drizzle/Supabase order writes are enabled in staging. Interface is repository-shaped for a one-swap migration.

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-301 | Pricing engine (tax/shipping) | Done |
| T-302 | PaymentProvider + Paybis + mock | Done |
| T-303 | Order repository + checkout actions | Done |
| T-304 | Checkout / pay / confirmation UI | Done |
| T-305 | Paybis webhook route | Done |
| T-310 | Unit tests + docs | Done |
