import { describe, it, expect } from "vitest";
import {
  normalizeValidationCode,
  validateProductCode,
} from "../../lib/account/validate-product";
import { orderConfirmationEmail } from "../../lib/email/resend";

describe("product validation", () => {
  it("accepts a known SKU", () => {
    const result = validateProductCode(`MIAMI_ICE-TEST${Date.now()}`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sku).toBe("MIAMI_ICE");
      expect(result.productSlug).toContain("miami");
    }
  });

  it("normalizes codes", () => {
    expect(normalizeValidationCode(" miami_ice ")).toBe("MIAMI_ICE");
  });

  it("rejects unknown codes", () => {
    const result = validateProductCode("NOT-A-REAL-SKU-999");
    expect(result.ok).toBe(false);
  });
});

describe("order confirmation email", () => {
  it("builds subject and total", () => {
    const email = orderConfirmationEmail({
      id: "ord_abc",
      email: "a@b.com",
      totalCents: 4599,
      lines: [{ productName: "Gelato", quantity: 1, unitPriceCents: 4500 }],
    });
    expect(email.subject).toContain("ord_abc");
    expect(email.html).toContain("$45.99");
    expect(email.to).toBe("a@b.com");
  });
});
