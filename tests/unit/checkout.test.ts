import { describe, it, expect } from "vitest";
import {
  computePricing,
  computeShippingCents,
  FREE_SHIPPING_THRESHOLD_CENTS,
  FLAT_SHIPPING_CENTS,
  FLAT_SHIPPING_INTL_CENTS,
} from "../../lib/checkout/pricing";
import type { CartLine } from "../../lib/cart/types";
import { PaybisPaymentProvider } from "../../lib/payments/paybis";
import { checkoutFormSchema } from "../../lib/checkout/validate";

const line = (price: number, qty = 1): CartLine => ({
  variantId: "v1",
  quantity: qty,
  productSlug: "x",
  productName: "X",
  lineName: "Signature",
  weightOrFormat: "1g",
  sku: "X-1G",
  unitPriceCents: price,
  thcPct: 80,
  cbdPct: 0.2,
  maxQuantity: 10,
});

describe("checkout pricing", () => {
  it("applies CA tax and $12 US flat shipping under threshold", () => {
    const pricing = computePricing([line(4000)], "CA");
    expect(pricing.subtotalCents).toBe(4000);
    expect(pricing.discountCents).toBe(0);
    expect(pricing.shippingCents).toBe(FLAT_SHIPPING_CENTS);
    expect(FLAT_SHIPPING_CENTS).toBe(1200);
    expect(pricing.taxCents).toBe(Math.round((4000 * 950) / 10000));
    expect(pricing.taxLabel).toContain("CA");
    expect(pricing.totalCents).toBe(pricing.taxableCents + pricing.taxCents + pricing.shippingCents);
  });

  it("gives free shipping at threshold", () => {
    const { shippingCents, shippingLabel } = computeShippingCents(FREE_SHIPPING_THRESHOLD_CENTS);
    expect(shippingCents).toBe(0);
    expect(shippingLabel.toLowerCase()).toContain("free");
  });

  it("uses higher MA tax rate than CA", () => {
    const ca = computePricing([line(10000)], "CA");
    const ma = computePricing([line(10000)], "MA");
    expect(ma.taxCents).toBeGreaterThan(ca.taxCents);
  });

  it("varies estimated tax by selected US state", () => {
    const ca = computePricing([line(10000)], { state: "CA", country: "US" });
    const tx = computePricing([line(10000)], { state: "TX", country: "US" });
    const or = computePricing([line(10000)], { state: "OR", country: "US" });
    expect(ca.taxLabel).toBe("CA estimated tax (9.50%)");
    expect(tx.taxLabel).toBe("TX estimated tax (8.25%)");
    expect(or.taxCents).toBe(0);
    expect(tx.taxCents).not.toBe(ca.taxCents);
  });

  it("applies $25 international flat shipping and country tax", () => {
    const pricing = computePricing([line(5000)], { state: "ENG", country: "GB" });
    expect(FLAT_SHIPPING_INTL_CENTS).toBe(2500);
    expect(pricing.shippingCents).toBe(FLAT_SHIPPING_INTL_CENTS);
    expect(pricing.shippingLabel).toMatch(/international/i);
    expect(pricing.taxCents).toBe(Math.round((5000 * 2000) / 10000));
    expect(pricing.taxLabel).toBe("United Kingdom estimated tax (20.00%)");
  });

  it("varies estimated tax by selected country", () => {
    const gb = computePricing([line(10000)], { state: "ENG", country: "GB" });
    const de = computePricing([line(10000)], { state: "BY", country: "DE" });
    const hk = computePricing([line(10000)], { state: "HK", country: "HK" });
    expect(gb.taxLabel).toBe("United Kingdom estimated tax (20.00%)");
    expect(de.taxLabel).toBe("Germany estimated tax (19.00%)");
    expect(hk.taxCents).toBe(0);
    expect(de.taxCents).not.toBe(gb.taxCents);
  });
});

describe("checkout form schema", () => {
  it("accepts a valid payload", () => {
    const result = checkoutFormSchema.safeParse({
      email: "buyer@example.com",
      phone: "4155550100",
      fullName: "Ada Lovelace",
      line1: "1 Market St",
      line2: "",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "US",
      paymentMethod: "paybis_btc",
      confirmAge: "on",
    });
    expect(result.success).toBe(true);
  });

  it("rejects bad postal code", () => {
    const result = checkoutFormSchema.safeParse({
      email: "buyer@example.com",
      phone: "4155550100",
      fullName: "Ada Lovelace",
      line1: "1 Market St",
      city: "San Francisco",
      state: "CA",
      postalCode: "!",
      country: "US",
      paymentMethod: "paybis_btc",
      confirmAge: "on",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing phone", () => {
    const result = checkoutFormSchema.safeParse({
      email: "buyer@example.com",
      phone: "",
      fullName: "Ada Lovelace",
      line1: "1 Market St",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "US",
      paymentMethod: "paybis_btc",
      confirmAge: "on",
    });
    expect(result.success).toBe(false);
  });

  it("accepts any US state", () => {
    const result = checkoutFormSchema.safeParse({
      email: "buyer@example.com",
      phone: "4155550100",
      fullName: "Ada Lovelace",
      line1: "1 Market St",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "US",
      paymentMethod: "zelle",
      confirmAge: "on",
    });
    expect(result.success).toBe(true);
  });

  it("accepts international shipping addresses", () => {
    const result = checkoutFormSchema.safeParse({
      email: "buyer@example.com",
      phone: "+447700900123",
      fullName: "Ada Lovelace",
      line1: "10 Downing St",
      city: "London",
      state: "England",
      postalCode: "SW1A 2AA",
      country: "GB",
      paymentMethod: "paybis_btc",
      confirmAge: "on",
    });
    expect(result.success).toBe(true);
  });
});

describe("Paybis provider mock mode", () => {
  it("creates a mock session when keys are absent", async () => {
    const prevKey = process.env.PAYBIS_API_KEY;
    const prevSecret = process.env.PAYBIS_API_SECRET;
    delete process.env.PAYBIS_API_KEY;
    delete process.env.PAYBIS_API_SECRET;

    const provider = new PaybisPaymentProvider();
    const session = await provider.createSession({
      orderId: "ord_test",
      amountCents: 5000,
      currency: "USD",
      customerEmail: "a@b.com",
      successUrl: "http://localhost/ok",
      failureUrl: "http://localhost/fail",
    });

    expect(session.mode).toBe("mock");
    expect(session.requestId).toBe("mock_ord_test");
    expect(session.checkoutUrl).toContain("/checkout/mock-pay/ord_test");

    process.env.PAYBIS_API_KEY = prevKey;
    process.env.PAYBIS_API_SECRET = prevSecret;
  });

  it("verifies webhook payloads without secret in dev", async () => {
    const prev = process.env.PAYBIS_WEBHOOK_SECRET;
    delete process.env.PAYBIS_WEBHOOK_SECRET;
    const provider = new PaybisPaymentProvider();
    const event = await provider.verifyWebhook(
      new Headers(),
      JSON.stringify({
        requestId: "mock_ord_1",
        status: "completed",
        metadata: { orderId: "ord_1" },
      })
    );
    expect(event?.status).toBe("completed");
    expect(event?.orderId).toBe("ord_1");
    process.env.PAYBIS_WEBHOOK_SECRET = prev;
  });
});
