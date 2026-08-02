// sentry.client.config.ts
//
// Runs in the browser. Kept intentionally conservative on sample rates —
// tune these up only once there's a real cost/volume tradeoff to weigh
// against actual traffic, not guessed at launch.

import * as Sentry from "@sentry/nextjs";

// Sentry SDK v8's dev stack-symbolication hooks are incompatible with
// Next.js 15.2+ (`/__nextjs_original-stack-frame` was replaced). Init in
// development causes overlay loops (`frame.join is not a function`).
if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",

    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0, // no session replay by default — reconsider only with an explicit privacy review, given this app handles age-verification/health-adjacent data
    replaysOnErrorSampleRate: 0,
  });
}
