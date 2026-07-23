# Sprint 2 Charter — Cart & Wishlist

**Status:** Active (authorized 2026-07-20)  
**Prior:** Sprint 1 exit approved  
**Phases:** Frontend + Backend commerce (pre-checkout)  
**Exit gate:** Guest + session cart, wishlist, recently viewed, cart drawer/page — **no payments**

---

## Scope (IN)

- Add / update / remove cart lines (variant + quantity)
- Guest cart persistence (HTTP cookie)
- Cart merge strategy documented for future auth login
- Cart page (`/cart`) + slide-over drawer
- Header cart badge
- Add to cart on PDP (variant select)
- Wishlist add/remove + `/wishlist` page
- Recently viewed (cookie, shown on PDP / shop teaser)
- Fee transparency strip on cart (subtotal only; tax/shipping at checkout Sprint 3)
- Unit tests for cart/wishlist pure logic

## Scope (OUT)

- Checkout / Paybis (Sprint 3)
- Inventory reservation
- DB-backed cart tables (cookie store for Sprint 2; schema ready for wishlists when auth+DB wired)
- Coupon application at cart (Sprint 3)

## Storage decision

| Concern | Sprint 2 approach | Later |
|---|---|---|
| Cart | Signed-shape JSON in `dime_cart` cookie | Optional `carts` / `cart_items` tables at auth scale |
| Wishlist | `dime_wishlist` cookie (variant ids) | Sync to `wishlists` table when logged in + DB live |
| Recently viewed | `dime_recent` cookie (product slugs, max 12) | Unchanged or profile preference |

## Task board

| Task ID | Title | Priority | Status |
|---|---|---|---|
| T-201 | Cart types + pure logic | P0 | Done |
| T-202 | Cart cookie + Server Actions | P0 | Done |
| T-203 | Cart page + drawer + header badge | P0 | Done |
| T-204 | PDP add-to-cart | P0 | Done |
| T-205 | Wishlist cookie + page + PDP toggle | P1 | Done |
| T-206 | Recently viewed | P1 | Done |
| T-210 | Unit tests | P0 | Done |
| T-220 | Progress doc | P2 | Done |

## Success criteria

1. Age-verified visitor can add variants to cart and see them after refresh
2. Quantity update / remove works on `/cart` and drawer
3. Wishlist persists across refresh
4. Recently viewed updates when opening a PDP
5. Checkout CTA present but routes to placeholder (Sprint 3) or disabled with clear copy
6. Unit tests pass; typecheck clean
