# Outreach Infrastructure (Section 9.4)

## Tooling stack (recommended)

| Job | Tools |
|-----|--------|
| Prospecting / DR | Ahrefs, Semrush |
| Contact finding | Hunter.io, Apollo.io, LinkedIn |
| Sequencing | Instantly.ai, Smartlead, Woodpecker, or Pitchbox |
| Mentions | Google Alerts, Ahrefs Alerts, Mention.com |
| Source platforms | Featured.com, Qwoted, Connectively (ex-HARO), Help a B2B Writer |
| Tracking | [`link_building_crm.csv`](./link_building_crm.csv) (or HubSpot/Airtable mirror) |

## Operating rules

- **Monthly volume:** ≥ 50 new contacts touched
- **Target acquisitions:** 5–10 qualifying wins / month ([quality standards](./link_quality_standards.md))
- **A/B tests:** 2 subject lines × 2 bodies per campaign; optimize on open + reply rate monthly
- **Sequence:** Day 0 → Day 3 → Day 7 → Archive
- **From address:** brand domain mailbox (e.g. `press@` / `partnerships@`) — not personal Gmail
- **Compliance:** CAN-SPAM / unsubscribe; cannabis ad policies of each outlet

## CRM columns (locked)

`Prospect Domain | Est DR | Contact Name | Email | Outreach Date | Follow-up 1 Date | Follow-up 2 Date | Status | Link Acquired (Y/N) | Link URL | Tier | Notes`

Status enum: `Research` | `Queued` | `Sent` | `Follow-up 1` | `Follow-up 2` | `Replied` | `Won` | `Lost` | `No reply` | `Compliance hold`

## First 30 days

1. Connect Ahrefs → finish backlink audit + refresh link gap DR
2. Stand up Google Alerts + Ahrefs Alerts
3. Import [`link_building_crm.csv`](./link_building_crm.csv) into sequencer (verify emails via Hunter)
4. Launch Tier 1 mention campaign + Tier 6 daily source replies
5. Book 2 podcast pitches (Tier 7)
