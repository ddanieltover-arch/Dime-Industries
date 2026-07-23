# Sprint 14 Charter — Phase 2 Wholesale (D-20)

**Status:** Complete (pending owner exit approval)  
**Prior:** Sprint 13 exit / Phase 2 approved  
**Exit gate:** Apply → admin approve → wholesale catalog + MOQ pricing → checkout with NET-30 / NET-60 / upfront

---

## Scope (IN)

- `commerce_wholesale_accounts` + `commerce_wholesale_price_overrides`
- Public `/wholesale` application; admin `/admin/wholesale` review
- Gated `/wholesale/shop` + separate wholesale cart
- Default tier pricing (discount from retail) + MOQ; per-variant overrides
- Checkout: NET terms invoice accept **or** Paybis upfront
- Demo auth `wholesale` role; orders carry `channel` / `paymentTerms`
- Unit tests + progress doc

## Scope (OUT)

- D-21 live COA/Rewards APIs
- Full AR aging / collections UI (invoice accept only)
- Per-account custom price matrices beyond overrides table
- Load test (D-24)

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-1401 | Migration + schema | Done |
| T-1402 | Accounts apply/approve store | Done |
| T-1403 | Wholesale catalog + cart | Done |
| T-1404 | NET/upfront checkout | Done |
| T-1410 | Admin UI + tests + docs | Done |
