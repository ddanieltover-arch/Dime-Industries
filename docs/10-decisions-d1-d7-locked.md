# Decisions Log — D1–D7 Locked

**Date:** 2026-07-20  
**Authority:** Project owner  
**Status:** Baseline — change requires formal change request

| ID | Decision | Locked value |
|---|---|---|
| D1 | Launch jurisdictions | CA + MA |
| D2 | Age verification | 21+ flat |
| D3 | Fulfillment model | Platform is licensed seller of record |
| D4 | COA + Rewards | Integrate existing hosted systems |
| D5 | Wholesale timing | Phase 2 (post-MVP) |
| D6 | Payment at launch | Paybis BTC only |
| D7 | M4.0 Architecture & Design Gate | **Approved** — Sprint 1 authorized |

## Implications for engineering

- Inventory/orders stay seller-of-record shaped (no `fulfilling_retailer_id` in Sprint 1–3).
- COA links are external URL stubs until DIME provides host API contracts.
- Rewards sync deferred until integration contracts exist; loyalty UI may stub later.
- Wholesale nav may exist; wholesale application/pricing not in Sprint 1–3.
- Payment abstraction required at Phase 12; only Paybis BTC configured at launch.
- Jurisdiction gating must support CA and MA from day one (already in age gate + catalog).

## Related docs

- `docs/09-sprint-1-charter.md`
- `docs/02-architecture.md`
- `docs/00-project-manager-mode.md`
