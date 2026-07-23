# DIME Enterprise Commerce Platform
## Backend Mode — Phase 1: Authentication, Users, Profiles, Roles

**Status:** Phase 1 complete, self-QA passed. No frontend built. Awaiting approval before Phase 2.

---

## What's in this phase

| File | Purpose |
|---|---|
| `db/migrations/0002_auth_sync_trigger.sql` | Postgres trigger: auto-creates a `public.users` profile row when Supabase Auth creates an `auth.users` row; keeps email in sync on change |
| `lib/supabase/server.ts` | Server-side Supabase client (Route Handlers/Server Actions) + a separate service-role client for legitimate RLS-bypass jobs only |
| `lib/supabase/client.ts` | Browser-side Supabase client (anon key only) |
| `lib/supabase/middleware.ts` | Session-refresh helper used by root middleware |
| `middleware.ts` | Root middleware: refreshes session on every request, gates `/admin` (admin), `/wholesale/shop` (wholesale), `/account` (any signed-in buyer role) |
| `lib/auth/roles.ts` | `Role` type + `hasAtLeastRole()` authorization check |
| `lib/auth/session.ts` | `getCurrentProfile()`, `requireUser()`, `requireRole()`, `requireAdmin()` — server-only helpers for Server Components/Actions |
| `app/auth/callback/route.ts` | Single callback target for both Google OAuth and email-verification links |
| `app/(auth)/actions.ts` | Server Actions: `signUpWithEmail`, `signInWithEmail`, `resendVerificationEmail`, `signInWithGoogle`, `signOut`, `updateProfile`, `setUserRole` |

## How the pieces fit together

- **Email verification** is handled by Supabase Auth's own signup-confirmation email (sent by the Supabase project, not this app) — `emailRedirectTo` points every auth flow at the one callback route, which exchanges the code for a session and lands the user on `/account`.
- **Google login** uses the same callback route — `signInWithGoogle()` just redirects to Supabase's OAuth URL first.
- **Profile creation** happens via a database trigger, not app code — this avoids the classic race condition where a client crashes between "auth signup succeeded" and "app code inserts the profile row," which would otherwise leave a user authenticated but profile-less.
- **Role management** is enforced twice: RLS (`rls_policies.sql`, already shipped) is the real boundary — a non-admin's role-change write is rejected at the database regardless of what the app code does. `setUserRole()` also checks explicitly first, purely so a non-admin gets a clear error message instead of a confusing silent failure.
- **Admin middleware** protects `/admin`, `/wholesale/shop`, and `/account` at the edge, before any page even renders — this is defense-in-depth alongside RLS, not a replacement for it (per Security Architecture §8: RLS is the hard boundary, middleware exists so unauthorized visitors get a clean redirect instead of a page that loads and fails on every query).

## Self-QA performed

This wasn't just a read-through — I set up a throwaway `tsconfig.json` + real dependencies (`next`, `@supabase/ssr`, `@supabase/supabase-js`, `zod`) and ran the actual TypeScript compiler against every file, then wrote and ran runtime test cases against the authorization logic specifically. Scaffolding was removed afterward — it's not part of the deliverable.

**Bugs found and fixed before you saw this code:**

1. **Next.js 15 breaking change** — `cookies()` and `headers()` became async in Next 15 (this project's target version per the tech stack). The first draft used them synchronously, which `tsc` caught immediately as real type errors, not warnings. Fixed by making `createClient()` async and awaiting it at all nine call sites across `server.ts`, `session.ts`, `actions.ts`, and the callback route.

2. **Privilege-escalation bug in the role-check function** — the first draft ranked `customer`, `wholesale`, and `vendor` at the same numeric tier for an "at least" comparison. That meant `hasAtLeastRole("customer", "wholesale")` evaluated to `true`: **any signed-in retail customer would have passed the `/wholesale/shop` middleware gate**, seeing wholesale-tier pricing they weren't authorized for. Caught by manually tracing the comparison, confirmed by writing 11 explicit test cases and running them — rewrote the function so lateral roles (wholesale/vendor) require an exact match, only `customer` treats wholesale/vendor as also-satisfying (since those accounts are still buyers), and re-ran the tests to confirm all 11 pass, including the specific case that was broken.

**Checked and confirmed correct (no changes needed):**
- Generic error messages on sign-in and sign-up failures (no "email already registered" vs. "wrong password" distinction) — prevents user enumeration.
- `setUserRole` writes an `audit_logs` row on every role change, per Security Architecture §8's requirement that admin actions be traceable.
- The OAuth callback validates that `next` is a same-origin relative path before redirecting — closes an open-redirect vector.
- RLS remains the actual enforcement boundary throughout; every app-layer check here is explicitly commented as defense-in-depth, not the real gate, so nobody mistakes middleware for security.

## What's explicitly NOT in this phase (by design, not oversight)

- **No custom email templates.** Verification email is Supabase Auth's built-in flow. The Resend-based transactional email system (order confirmations, etc.) is an Integrations-phase deliverable per the roadmap, not Phase 1.
- **No rate limiting or CAPTCHA on signup/login in application code.** Per the API Architecture document, rate limiting is applied at the Vercel edge for these routes — that's an infrastructure/config concern, not something this phase's code implements directly. Worth confirming edge rate-limit rules are actually configured before this goes live.
- **No automated test suite.** Testing is its own phase later in the workflow; the tsc + runtime checks above are self-QA for this phase, not a substitute for the Vitest/Playwright suite that comes in the QA phase.
- **Google OAuth requires external configuration** (a Google Cloud OAuth client ID/secret registered in the Supabase project) that lives outside this codebase — flagging as a dependency, not something the code can self-verify.

---

**Status: Phase 1 self-QA complete. Awaiting your approval before Phase 2.**
