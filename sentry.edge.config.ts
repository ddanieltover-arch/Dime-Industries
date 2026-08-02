// sentry.edge.config.ts
//
// Runs in the Edge Runtime — specifically, this app's middleware.ts. Kept
// separate from server.config because the Edge Runtime has a different,
// smaller API surface than Node.js (no Node APIs), which is exactly why
// Sentry's Next.js SDK requires a distinct init file for it.

import * as Sentry from "@sentry/nextjs";

// See sentry.client.config.ts — skip init in development.
if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: 0.1,
  });
}
