# Sprint 11 Progress Report — Cart Sync + CMS/Coupons DB

**Date:** 2026-07-21  
**Status:** Implementation complete — awaiting owner review / Sprint 11 exit approval

---

## Completed deliverables

| Area | Deliverable |
|---|---|
| Migration | `0005_commerce_growth.sql` |
| Cart (D-03) | `commerce_carts`; logged-in read/write; `mergeGuestCartForUser` on demo + email login |
| CMS (D-10) | `commerce_cms_pages`, `commerce_blog_posts`, banner in `site_settings` |
| Coupons (D-11) | `commerce_coupons` with seed on empty; applied code remains cookie |
| Launch | `growth_persistence` check |
| Tests | Cart merge unit tests |

## Enable

Same as Sprint 10: set `DATABASE_URL`, apply migrations `0004` + `0005`, leave `ORDERS_PERSISTENCE=auto`.

## Verify

```bash
npx vitest run && npx tsc --noEmit
# With DATABASE_URL: login → add to cart → other browser/session as same user → cart present
# Admin CMS edit → new browser still shows content
```

## Remaining debt

Loyalty/affiliate DB, catalog overrides DB, inventory reservation.

## Recommendation

Approve Sprint 11 exit. Next: **Sprint 12 — loyalty/affiliate + catalog overrides DB**, or owner cutover.
