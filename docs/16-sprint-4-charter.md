# Sprint 4 Charter — Customer Dashboard

**Status:** Active (authorized 2026-07-20)  
**Prior:** Sprint 3 exit approved  
**Exit gate:** Account portal with orders, profile, addresses, notifications, validate; auth UI; Resend order email hook

---

## Scope (IN)

- `/login`, `/signup` (email + Google) + sign out
- Demo session fallback when Supabase env is unset (local/dev only)
- `/account` dashboard shell + nav
- `/account/orders` (+ order detail)
- `/account/profile`, `/account/addresses`, `/account/notifications`
- `/account/validate` product authenticity entry
- Resend order-confirmation email on paid (no-op/log when `RESEND_API_KEY` unset)
- Wire confirmation page → account orders
- Unit tests for account prefs + validation logic

## Scope (OUT)

- Loyalty / affiliate dashboards (Sprint 6)
- Returns workflow UI (stub link only)
- Admin (Sprint 5)
- Full DB address sync (cookie prefs for Sprint 4; Supabase profile phone when auth live)

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-401 | Auth pages + demo session | Done |
| T-402 | Account layout + dashboard | Done |
| T-403 | Orders / profile / addresses / notifications | Done |
| T-404 | Product validate | Done |
| T-405 | Resend order email | Done |
| T-410 | Tests + docs | Done |
