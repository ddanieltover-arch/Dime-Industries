import { describe, it, expect } from "vitest";
import {
  normalizeValidationCode,
  validateProductCode,
} from "../../lib/account/validate-product";
import { orderConfirmationEmail } from "../../lib/email/resend";

describe("product validation", () => {
  it("normalizes codes", () => {
    expect(normalizeValidationCode(" lr-gelato-1g ")).toBe("LR-GELATO-1G");
  });

  it("accepts a known SKU", () => {
    const result = validateProductCode(`LR-GELATO-1G-TEST${Date.now()}`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sku).toBe("LR-GELATO-1G");
      expect(result.productSlug).toContain("gelato");
    }
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
