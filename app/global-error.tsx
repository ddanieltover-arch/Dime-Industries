// app/global-error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production reporting is handled by instrumentation.onRequestError /
    // Sentry server config. Do not import @sentry/nextjs here — it pulls
    // OpenTelemetry into the client webpack graph and breaks module factories
    // (`frame.join` / `reading 'call'`).
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 40 + "rem" }}>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. You can try again, or return home.</p>
          <p>
            <button type="button" onClick={() => reset()}>
              Try again
            </button>
            {" · "}
            <a href="/">Home</a>
          </p>
        </main>
      </body>
    </html>
  );
}
