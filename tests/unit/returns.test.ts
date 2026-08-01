import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const cookiesStore = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookiesStore.get(name);
      return value ? { value } : undefined;
    },
    set: (name: string, value: string) => {
      cookiesStore.set(name, value);
    },
  }),
}));

vi.mock("@/lib/db/growth-mode", () => ({
  isGrowthDatabaseMode: () => false,
}));

const getOrderById = vi.fn();

vi.mock("@/lib/checkout", () => ({
  getOrderById: (...args: unknown[]) => getOrderById(...args),
}));

import { requestReturn, reviewReturn, listReturns } from "../../lib/returns/store";
import { RETURNS_COOKIE } from "../../lib/returns/store";

describe("returns workflow", () => {
  beforeEach(() => {
    cookiesStore.clear();
    getOrderById.mockReset();
  });

  it("rejects returns for unpaid orders", async () => {
    getOrderById.mockResolvedValue({
      id: "ord_1",
      email: "a@example.com",
      status: "pending",
    });
    const result = await requestReturn({
      orderId: "ord_1",
      email: "a@example.com",
      reason: "defective_hardware",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/payment/i);
  });

  it("creates a requested return for a paid order", async () => {
    getOrderById.mockResolvedValue({
      id: "ord_2",
      email: "a@example.com",
      status: "payment_confirmed",
    });
    const result = await requestReturn({
      orderId: "ord_2",
      email: "a@example.com",
      reason: "wrong_item",
      details: "Received Pink Rose instead of Miami Ice",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request.status).toBe("requested");
    expect(cookiesStore.has(RETURNS_COOKIE)).toBe(true);

    const listed = await listReturns("a@example.com");
    expect(listed).toHaveLength(1);
    expect(listed[0]!.orderId).toBe("ord_2");
  });

  it("blocks duplicate open returns on the same order", async () => {
    getOrderById.mockResolvedValue({
      id: "ord_3",
      email: "a@example.com",
      status: "payment_confirmed",
    });
    const first = await requestReturn({
      orderId: "ord_3",
      email: "a@example.com",
      reason: "damaged_shipping",
    });
    expect(first.ok).toBe(true);
    const second = await requestReturn({
      orderId: "ord_3",
      email: "a@example.com",
      reason: "other",
    });
    expect(second.ok).toBe(false);
  });

  it("reviews requested → approved → refunded", async () => {
    getOrderById.mockResolvedValue({
      id: "ord_4",
      email: "b@example.com",
      status: "payment_confirmed",
    });
    const created = await requestReturn({
      orderId: "ord_4",
      email: "b@example.com",
      reason: "defective_hardware",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const approved = await reviewReturn(created.request.id, "approved", "RMA issued");
    expect(approved?.status).toBe("approved");
    expect(approved?.adminNote).toBe("RMA issued");

    const refunded = await reviewReturn(created.request.id, "refunded", "Refunded via Paybis");
    expect(refunded?.status).toBe("refunded");
    expect(refunded?.resolvedAt).toBeTruthy();
  });
});
