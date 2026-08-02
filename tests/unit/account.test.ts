import { describe, it, expect } from "vitest";
import {
  normalizeValidationCode,
  validateProductCode,
} from "../../lib/account/validate-product";
import { getAdminEmail, orderConfirmationEmail } from "../../lib/email/resend";
import {
  adminOrderNotification,
  customerContactConfirmation,
  customerNewsletterWelcome,
  customerWholesaleApplicationReceived,
} from "../../lib/email/templates";

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
  it("builds subject and total for customer", () => {
    const email = orderConfirmationEmail({
      id: "ord_abc",
      email: "a@b.com",
      totalCents: 4599,
      lines: [{ productName: "Gelato", quantity: 1, unitPriceCents: 4500 }],
    });
    expect(email.subject).toContain("ord_abc");
    expect(email.html).toContain("$45.99");
    expect(email.html).toContain("DIME Industries");
    expect(email.to).toBe("a@b.com");
  });

  it("builds admin order alert", () => {
    const email = adminOrderNotification({
      id: "ord_abc",
      email: "a@b.com",
      totalCents: 4599,
      lines: [{ productName: "Gelato", quantity: 1, unitPriceCents: 4500 }],
      channel: "retail",
    });
    expect(email.subject).toContain("[DIME]");
    expect(email.subject).toContain("ord_abc");
    expect(email.html).toContain("a@b.com");
    expect(email.replyTo).toBe("a@b.com");
  });
});

describe("form notification templates", () => {
  it("builds wholesale application emails", () => {
    const email = customerWholesaleApplicationReceived({
      email: "buyer@shop.com",
      businessName: "Green Supply Co",
      preferredTerms: "net30",
    });
    expect(email.to).toBe("buyer@shop.com");
    expect(email.html).toContain("Green Supply Co");
    expect(email.subject).toMatch(/wholesale/i);
  });

  it("builds newsletter welcome", () => {
    const email = customerNewsletterWelcome("fan@example.com");
    expect(email.to).toBe("fan@example.com");
    expect(email.html).toContain("members");
  });

  it("builds contact confirmation", () => {
    const email = customerContactConfirmation({
      name: "Alex",
      email: "alex@example.com",
      subject: "Order help",
      message: "Where is my package?",
      orderId: "ord_123",
    });
    expect(email.to).toBe("alex@example.com");
    expect(email.html).toContain("ord_123");
    expect(email.html).toContain("Order help");
  });

  it("defaults admin email to support inbox", () => {
    const prev = process.env.ADMIN_EMAIL;
    const prevNotify = process.env.ORDER_NOTIFY_TO;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ORDER_NOTIFY_TO;
    expect(getAdminEmail()).toBe("sales@dimeindustries.us");
    if (prev !== undefined) process.env.ADMIN_EMAIL = prev;
    if (prevNotify !== undefined) process.env.ORDER_NOTIFY_TO = prevNotify;
  });
});
