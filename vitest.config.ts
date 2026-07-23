import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    // Next.js aliases "server-only" to a no-op at build time (via its own
    // webpack config) specifically so this package's guard only fires in a
    // real client bundle, never in tests or server code. Vitest doesn't run
    // through Next's webpack config, so it needs the same alias explicitly
    // — otherwise every server-only module fails to import in tests even
    // though it's being used correctly.
    alias: {
      "@": path.resolve(__dirname),
      "server-only": path.resolve(__dirname, "tests/__mocks__/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    // Playwright owns tests/e2e/** with its own runner/config — without this
    // scoping, Vitest's default glob also picks up *.spec.ts files there and
    // tries to execute Playwright's test.describe() as if it were a Vitest
    // suite, which fails immediately (different test runner API entirely).
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
  },
});
