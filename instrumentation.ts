// instrumentation.ts (project root)
//
// Next.js 15's instrumentation hook — the single entry point that loads the
// right Sentry config for whichever runtime the current request is in.
// Requires `experimental.instrumentationHook` is NOT needed on Next 15 (it's
// stable/default on); if this is ever added to a Next <13.4 project, that
// flag would need to be set explicitly in next.config.js.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
