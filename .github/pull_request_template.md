## What does this change?

<!-- One or two sentences. What behavior changes, and why. -->

## Type of change

- [ ] New feature
- [ ] Bug fix
- [ ] Database migration
- [ ] Refactor / code quality
- [ ] Documentation / DevOps

## Checklist

- [ ] `pnpm typecheck` and `pnpm lint` pass locally
- [ ] Unit tests added/updated for new logic, and `pnpm test:unit` passes
- [ ] If this touches RLS or the schema: migration is additive-only, OR the destructive change follows the expand-migrate-contract pattern documented in `DIME-Enterprise-Commerce-Database-Design.md`
- [ ] If this touches auth, roles, or middleware: traced through what an unauthorized caller could do differently — not just what an authorized one can now do
- [ ] If this touches a color/contrast-sensitive UI element: contrast checked, not assumed
- [ ] No secrets, API keys, or `.env` values committed

## Database migration (delete this section if not applicable)

- [ ] Migration file is numbered after the current latest in `db/migrations/`
- [ ] Ran the migration-dry-run locally against a fresh Postgres instance
- [ ] `db/schema.ts` (Drizzle) updated to match

## Screenshots / recording (for UI changes)

<!-- Before/after, or a short clip. -->
