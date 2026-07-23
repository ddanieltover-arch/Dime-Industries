import { describe, it, expect } from "vitest";
import { isLaunchJurisdiction, LAUNCH_JURISDICTIONS } from "../../lib/compliance/jurisdictions";

describe("isLaunchJurisdiction", () => {
  it("accepts every launch jurisdiction", () => {
    for (const j of LAUNCH_JURISDICTIONS) {
      expect(isLaunchJurisdiction(j)).toBe(true);
    }
  });

  it("rejects jurisdictions outside the launch set", () => {
    expect(isLaunchJurisdiction("NY")).toBe(false);
    expect(isLaunchJurisdiction("TX")).toBe(false);
    expect(isLaunchJurisdiction("")).toBe(false);
    expect(isLaunchJurisdiction("OTHER")).toBe(false);
  });

  it("is case-sensitive on purpose — callers must normalize before calling", () => {
    expect(isLaunchJurisdiction("ca")).toBe(false);
  });
});
