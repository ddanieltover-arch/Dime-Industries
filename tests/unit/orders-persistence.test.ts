// tests/unit/orders-persistence.test.ts
import { describe, it, expect } from "vitest";
import {
  isOrdersDatabaseMode,
  resolveOrdersPersistence,
} from "../../lib/checkout/repository";

describe("resolveOrdersPersistence", () => {
  it("defaults to cookie without DATABASE_URL", () => {
    expect(resolveOrdersPersistence({ ORDERS_PERSISTENCE: "auto" })).toBe("cookie");
  });

  it("auto-selects database when DATABASE_URL is set", () => {
    expect(
      resolveOrdersPersistence({
        ORDERS_PERSISTENCE: "auto",
        DATABASE_URL: "postgres://localhost/dime",
      })
    ).toBe("database");
  });

  it("forces cookie when requested", () => {
    expect(
      resolveOrdersPersistence({
        ORDERS_PERSISTENCE: "cookie",
        DATABASE_URL: "postgres://localhost/dime",
      })
    ).toBe("cookie");
  });

  it("throws when database forced without URL", () => {
    expect(() => resolveOrdersPersistence({ ORDERS_PERSISTENCE: "database" })).toThrow(
      /DATABASE_URL/
    );
  });
});

describe("isOrdersDatabaseMode", () => {
  it("is false without URL", () => {
    expect(isOrdersDatabaseMode({ ORDERS_PERSISTENCE: "auto" })).toBe(false);
  });

  it("is true with URL and auto", () => {
    expect(
      isOrdersDatabaseMode({
        ORDERS_PERSISTENCE: "auto",
        DATABASE_URL: "postgres://localhost/dime",
      })
    ).toBe(true);
  });
});
