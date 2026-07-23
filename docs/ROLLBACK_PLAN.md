# Rollback Plan — Production

Three different scenarios need three different responses. Diagnose which one you're in before acting — the wrong rollback can make things worse (e.g., rolling back app code while a migration it depended on stays applied).

## Scenario 1: App-only issue, no migration involved

Symptoms: errors in Sentry, broken UI, failed health check — but this release had no database migration, or the migration is confirmed unrelated to the issue.

**This is the fast, safe case.** Vercel deployments are immutable — rollback is promoting the previous deployment, not rebuilding.

1. In the `dime-production` Vercel project dashboard, find the previous known-good deployment.
2. Promote it to Production (Vercel dashboard → Deployments → select the previous one → "Promote to Production"). This takes effect in seconds, no rebuild.
3. Confirm `GET /api/health` returns 200 and the issue is resolved.
4. File an incident note: what broke, what the rollback was, what commit is now live vs. what was intended.

## Scenario 2: This release included a migration

This is why the Deploy Checklist requires migrations to be additive-only or expand-migrate-contract. Two sub-cases:

**2a. Migration was additive (new nullable column/table, new index, etc.):** rolling back the app code (Scenario 1's steps) is safe even with the new migration still applied — old app code simply doesn't reference the new column/table. No database rollback needed. This is the whole point of requiring additive-only migrations for anything not using expand-migrate-contract.

**2b. Migration was destructive and something's wrong:** this should not happen if the Deploy Checklist was actually followed (destructive changes require expand-migrate-contract, meaning the "contract" step that actually removes anything is a *separate*, later release — so this scenario means the checklist was skipped, not that the process failed). If it happens anyway:
1. Do not attempt to write a new "undo" migration under pressure — that's how a bad situation becomes two bad situations.
2. Roll back the app code first (Scenario 1) to stop active damage.
3. Restore the database from Supabase PITR to a point immediately before the destructive migration ran (Supabase dashboard → Database → Backups → Point in Time Recovery). This requires the same `production` GitHub Environment approval path as a deploy — restoring prod data is not a unilateral action.
4. After restore, confirm data integrity manually before resuming traffic — don't assume the restore point was clean just because it predates the bad migration.

## Scenario 3: Data corruption or a security incident (not just a bad deploy)

Example: the class of RLS bug found and fixed in QA Mode, if a similar one had reached production and been exploited.

1. This is not primarily a "rollback" problem — rolling back app code doesn't undo data that was already read/written by a caller exploiting a gap.
2. Immediate: if the issue is an active RLS/auth gap, the fastest containment is often disabling the affected feature/route at the Vercel edge (a feature flag in `site_settings`, or in the extreme case, redirecting the affected route) rather than a full rollback — a full app rollback might reintroduce an *older* bug instead of fixing anything.
3. Identify what data was actually exposed/modified using `audit_logs` (this is exactly why that table exists and why it has no client-writable path — it's the one source of truth that can't have been tampered with via the same RLS gap).
4. This scenario needs human judgment about compliance/legal notification obligations (this app handles age-verification and, per SRS §7, jurisdiction-sensitive commerce data) — that decision is explicitly out of scope for this document to make unilaterally; escalate to whoever owns that call.

## Who can execute a rollback

- **Scenario 1 (app-only):** any engineer with Vercel production access — deliberately kept low-friction, since speed matters most here and the action is safe/reversible.
- **Scenario 2b and Scenario 3:** requires the same approval path as a production deploy (`production` GitHub Environment reviewers) for the database-restore step specifically — not for the initial containment steps, which shouldn't wait on approval.

## After any rollback

Write down what happened before memory fades: what broke, how it was caught, what the rollback was, and — most importantly — what in the Deploy Checklist or QA process would have caught this earlier. A rollback that doesn't produce a process change is a missed opportunity, not a resolved incident.
