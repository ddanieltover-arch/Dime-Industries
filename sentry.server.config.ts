// sentry.server.config.ts
//
// Runs in Node.js server contexts (Route Handlers, Server Actions).

import * as Sentry from "@sentry/nextjs";

// See sentry.client.config.ts — skip init in development to avoid Next 15.2+
// stack-frame symbolication incompatibilities with Sentry SDK v8.
if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: 0.1,

    beforeSend(event) {
      // Server-side events can carry request data — scrub anything that looks
      // like an auth cookie or the service-role key before it ever leaves the
      // process, as a defense-in-depth measure on top of Sentry's own PII
      // scrubbing defaults.
      if (event.request?.headers) {
        delete event.request.headers["cookie"];
        delete event.request.headers["authorization"];
      }
      return event;
    },
  });
}
