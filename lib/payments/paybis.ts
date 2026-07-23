// lib/payments/paybis.ts
// Paybis adapter. When API credentials are missing, runs in mock mode so
// checkout can be developed/tested end-to-end without a live Paybis account.
// Live mode shapes requests after Paybis widget/session docs (requestId +
// success/failure return URLs). Exact REST paths are env-overridable.

import { createHmac, timingSafeEqual } from "crypto";
import type {
  CreatePaymentSessionInput,
  PaymentProvider,
  PaymentSession,
  PaymentWebhookEvent,
} from "./types";

function env(name: string) {
  return process.env[name]?.trim() || "";
}

export function isPaybisLiveConfigured() {
  return Boolean(env("PAYBIS_API_KEY") && env("PAYBIS_API_SECRET"));
}

function signPayload(secret: string, body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export class PaybisPaymentProvider implements PaymentProvider {
  readonly name = "paybis" as const;

  async createSession(input: CreatePaymentSessionInput): Promise<PaymentSession> {
    const createdAt = new Date().toISOString();

    if (!isPaybisLiveConfigured()) {
      const requestId = `mock_${input.orderId}`;
      const base =
        env("NEXT_PUBLIC_APP_URL") ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      return {
        provider: "paybis",
        mode: "mock",
        requestId,
        checkoutUrl: `${base}/checkout/mock-pay/${input.orderId}?requestId=${encodeURIComponent(requestId)}`,
        amountCents: input.amountCents,
        currency: input.currency,
        createdAt,
      };
    }

    // Live path — partner API details vary by Paybis product (widget vs pay-in).
    // We POST to a configurable endpoint and expect `{ requestId }` back.
    const apiBase = env("PAYBIS_API_BASE") || "https://api.paybis.com";
    const requestId = crypto.randomUUID();
    const body = {
      requestId,
      amount: (input.amountCents / 100).toFixed(2),
      currency: "USD",
      cryptoCurrency: "BTC",
      email: input.customerEmail,
      successReturnURL: input.successUrl,
      failureReturnURL: input.failureUrl,
      metadata: { orderId: input.orderId, ...input.metadata },
    };

    const res = await fetch(`${apiBase}/v1/payment/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Paybis-Api-Key": env("PAYBIS_API_KEY"),
        // Partner signing is account-specific; send HMAC of body as a standard header.
        "X-Paybis-Signature": signPayload(env("PAYBIS_API_SECRET"), JSON.stringify(body)),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Paybis session failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as { requestId?: string; redirectUrl?: string };
    const rid = data.requestId ?? requestId;
    const widgetBase = env("PAYBIS_WIDGET_BASE") || "https://widget.paybis.com";
    const checkoutUrl =
      data.redirectUrl ??
      `${widgetBase}/?requestId=${encodeURIComponent(rid)}&successReturnURL=${encodeURIComponent(input.successUrl)}&failureReturnURL=${encodeURIComponent(input.failureUrl)}`;

    return {
      provider: "paybis",
      mode: "live",
      requestId: rid,
      checkoutUrl,
      amountCents: input.amountCents,
      currency: input.currency,
      createdAt,
    };
  }

  async verifyWebhook(headers: Headers, body: string): Promise<PaymentWebhookEvent | null> {
    const secret = env("PAYBIS_WEBHOOK_SECRET");
    if (secret) {
      const signature =
        headers.get("x-paybis-signature") ??
        headers.get("x-signature") ??
        headers.get("paybis-signature") ??
        "";
      const expected = signPayload(secret, body);
      if (!safeEqualHex(signature, expected) && signature !== expected) {
        // Also allow raw hex compare when provider sends non-hex (timing-safe on equal length utf8)
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
      }
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(body) as Record<string, unknown>;
    } catch {
      return null;
    }

    const requestId = String(
      parsed.requestId ?? parsed.request_id ?? (parsed.transaction as { requestId?: string } | undefined)?.requestId ?? ""
    );
    if (!requestId) return null;

    const statusRaw = String(
      parsed.status ??
        (parsed.transaction as { status?: string } | undefined)?.status ??
        ""
    ).toLowerCase();

    let status: PaymentWebhookEvent["status"] = "pending";
    if (["completed", "complete", "deposit_confirmed", "paid", "success"].includes(statusRaw)) {
      status = "completed";
    } else if (["rejected", "failed", "fail"].includes(statusRaw)) {
      status = "rejected";
    } else if (["cancelled", "canceled"].includes(statusRaw)) {
      status = "cancelled";
    }

    const meta = parsed.metadata as { orderId?: string } | undefined;
    const orderId =
      (typeof parsed.orderId === "string" && parsed.orderId) ||
      meta?.orderId ||
      (requestId.startsWith("mock_") ? requestId.slice("mock_".length) : null);

    return { requestId, orderId, status, raw: parsed };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new PaybisPaymentProvider();
}
