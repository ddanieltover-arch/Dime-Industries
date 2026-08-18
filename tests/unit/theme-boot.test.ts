import { describe, expect, it, vi, afterEach } from "vitest";
import { THEME_BOOT_SCRIPT, THEME_STORAGE_KEY } from "@/lib/theme/storage";

describe("theme boot script", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is a true IIFE, not the bang-wrapper that evaluates to false()", () => {
    expect(THEME_BOOT_SCRIPT.startsWith("(function(){")).toBe(true);
    expect(THEME_BOOT_SCRIPT.includes("(!function")).toBe(false);
    expect(THEME_BOOT_SCRIPT).toContain(THEME_STORAGE_KEY);
  });

  it("applies a stored theme without throwing", () => {
    const setAttribute = vi.fn();
    vi.stubGlobal("document", {
      documentElement: { setAttribute },
    });
    vi.stubGlobal("localStorage", {
      getItem: () => "light",
    });

    expect(() => {
      // Production head script — eval matches browser inline execution.
      // eslint-disable-next-line no-eval
      eval(THEME_BOOT_SCRIPT);
    }).not.toThrow();

    expect(setAttribute).toHaveBeenCalledWith("data-theme", "light");
  });

  it("documents why (!function(){})() is invalid", () => {
    expect(() => {
      // eslint-disable-next-line no-eval
      eval("(!function(){return 1})()");
    }).toThrow(/not a function/);
  });
});
