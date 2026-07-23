import { describe, it, expect } from "vitest";
import {
  addWishlistId,
  mergeWishlistIds,
  removeWishlistId,
  toggleWishlistId,
} from "../../lib/wishlist/logic";
import { pushRecentSlug } from "../../lib/recently-viewed/logic";

describe("wishlist logic", () => {
  it("toggles ids on and off", () => {
    const added = toggleWishlistId([], "v1");
    expect(added).toEqual(["v1"]);
    expect(toggleWishlistId(added, "v1")).toEqual([]);
  });

  it("add is idempotent", () => {
    expect(addWishlistId(["v1"], "v1")).toEqual(["v1"]);
  });

  it("removes by id", () => {
    expect(removeWishlistId(["v1", "v2"], "v1")).toEqual(["v2"]);
  });

  it("merges guest ids without duplicates and respects max", () => {
    expect(mergeWishlistIds(["a"], ["a", "b"])).toEqual(["a", "b"]);
    expect(mergeWishlistIds(["a", "b"], ["c", "d"], 3)).toEqual(["a", "b", "c"]);
  });
});

describe("recently viewed logic", () => {
  it("prepends newest and dedupes", () => {
    expect(pushRecentSlug(["a", "b"], "c")).toEqual(["c", "a", "b"]);
    expect(pushRecentSlug(["a", "b"], "a")).toEqual(["a", "b"]);
  });

  it("caps list length", () => {
    const slugs = Array.from({ length: 20 }, (_, i) => `p${i}`);
    const next = pushRecentSlug(slugs, "new", 12);
    expect(next).toHaveLength(12);
    expect(next[0]).toBe("new");
  });
});
