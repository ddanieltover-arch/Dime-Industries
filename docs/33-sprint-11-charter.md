# Sprint 11 Charter — Cart Sync + CMS/Coupons DB

**Status:** Complete (awaiting exit approval)  
**Prior:** Sprint 10 exit approved  
**Exit gate:** Logged-in cart syncs to DB with guest merge on login; CMS + coupons read/write Postgres when DATABASE_URL enabled; cookie fallback retained

---

## Scope (IN)

- D-03: `commerce_carts` + merge guest cookie into user cart on login
- D-10: `commerce_cms_pages`, `commerce_blog_posts`, banner via `site_settings`
- D-11: `commerce_coupons` (+ seed codes); applied coupon stays session cookie
- Migration `0005_commerce_growth.sql`
- Launch-status updates
- Unit tests + progress doc

## Scope (OUT)

- Loyalty/affiliate DB (still P1/P2)
- Wishlist UUID FK table wiring to seed catalog
- Canonical `cms_pages.blocks` migration of all content

## Task board

| Task ID | Title | Status |
|---|---|---|
| T-1101 | Migration + schema | Done |
| T-1102 | Cart DB + login merge | Done |
| T-1103 | CMS DB store | Done |
| T-1104 | Coupons DB store | Done |
| T-1110 | Tests + docs | Done |
