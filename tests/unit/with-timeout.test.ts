import { describe, expect, it, vi } from "vitest";
import { withTimeout, withTimeoutFallback } from "../../lib/async/with-timeout";

describe("withTimeout", () => {
  it("resolves when the work finishes in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 50, "fast")).resolves.toBe("ok");
  });

  it("rejects when the work exceeds the budget", async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise(() => undefined), 40, "stuck");
    const assertion = expect(pending).rejects.toThrow(/stuck.*40ms/);
    await vi.advanceTimersByTimeAsync(40);
    await assertion;
    vi.useRealTimers();
  });
});

describe("withTimeoutFallback", () => {
  it("returns the fallback when the work is still pending", async () => {
    vi.useFakeTimers();
    const pending = withTimeoutFallback(new Promise<string>(() => undefined), 30, "seed");
    const assertion = expect(pending).resolves.toBe("seed");
    await vi.advanceTimersByTimeAsync(30);
    await assertion;
    vi.useRealTimers();
  });
});
