import { describe, expect, it } from "vitest";
import { searchQueryFromSku } from "@/lib/integrations/coa/query";

describe("searchQueryFromSku", () => {
  it("strips catalog prefixes and size suffixes", () => {
    expect(searchQueryFromSku("V-MIAMI-ICE-1G")).toBe("MIAMI ICE");
    expect(searchQueryFromSku("V-KEY-LIME-PIE-1G")).toBe("KEY LIME PIE");
  });
});
