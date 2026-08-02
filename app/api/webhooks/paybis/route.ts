// app/api/webhooks/paybis/route.ts
import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { clientIpFromRequest, rateLimit } from "@/lib/security/rate-limit";
import { getOrderRepository } from "@/lib/checkout";
import { earnLoyaltyPoints } from "@/lib/loyalty/store";
import { attributeAffiliateConversion } from "@/lib/affiliate/store";

/**
 * Paybis payment status webhook.
 * When ORDERS_PERSISTENCE resolves to database, marks orders paid by
 * paymentRequestId (or orderId metadata). Cookie mode cannot be mutated
 * from a server-to-server call — persisted stays false.
 */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`paybis-webhook:${ip}`, 60, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const secret = process.env.PAYBIS_WEBHOOK_SECRET?.trim();
  if (process.env.NODE_ENV === "production" && !secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const provider = getPaymentProvider();
  const event = await provider.verifyWebhook(request.headers, body);

  if (!event) {
    return NextResponse.json({ error: "Invalid signature or payload" }, { status: 401 });
  }

  console.info("[paybis.webhook]", {
    requestId: event.requestId,
    orderId: event.orderId,
    status: event.status,
  });

  const orders = getOrderRepository();
  let persisted = false;
  let orderId = event.orderId;

  if (orders.mode === "database" && event.status === "completed") {
    let paid =
      (event.requestId
        ? await orders.markPaidByPaymentRequestId(event.requestId)
        : null) ?? null;

    if (!paid && event.orderId) {
      paid = await orders.markPaid(event.orderId);
    }

    if (paid) {
      persisted = true;
      orderId = paid.id;
      try {
        const { commitInventoryForOrder } = await import("@/lib/inventory");
        await commitInventoryForOrder(paid.id);
      } catch (err) {
        console.warn("[paybis.webhook] inventory commit failed", err);
      }
      try {
        if ((paid.loyaltyPointsRedeemed ?? 0) > 0) {
          const { adjustLoyaltyPoints } = await import("@/lib/loyalty/store");
          await adjustLoyaltyPoints(
            paid.email,
            -paid.loyaltyPointsRedeemed!,
            `Redeemed on order ${paid.id}`
          );
        }
        await earnLoyaltyPoints(paid.email, paid.totalCents, paid.id);
        await attributeAffiliateConversion(paid.totalCents);
      } catch (err) {
        console.warn("[paybis.webhook] loyalty/affiliate side effects failed", err);
      }
      try {
        const { notifyOrderConfirmed } = await import("@/lib/email/notifications");
        await notifyOrderConfirmed(paid);
      } catch (err) {
        console.warn("[paybis.webhook] email side effect failed", err);
      }
    }
  } else if (orders.mode === "database" && event.status === "rejected") {
    const hit =
      (await orders.getByPaymentRequestId(event.requestId)) ??
      (event.orderId ? await orders.getById(event.orderId) : null);
    if (hit && hit.status === "pending") {
      const { changeOrderStatus } = await import("@/lib/checkout/status-change");
      await changeOrderStatus(hit.id, "rejected", { notify: true });
      try {
        const { releaseInventoryForOrder } = await import("@/lib/inventory");
        await releaseInventoryForOrder(hit.id);
      } catch (err) {
        console.warn("[paybis.webhook] inventory release failed", err);
      }
      persisted = true;
      orderId = hit.id;
    }
  } else if (orders.mode === "database" && event.status === "cancelled") {
    const hit =
      (await orders.getByPaymentRequestId(event.requestId)) ??
      (event.orderId ? await orders.getById(event.orderId) : null);
    if (hit && hit.status === "pending") {
      const { changeOrderStatus } = await import("@/lib/checkout/status-change");
      await changeOrderStatus(hit.id, "cancelled", { notify: true });
      try {
        const { releaseInventoryForOrder } = await import("@/lib/inventory");
        await releaseInventoryForOrder(hit.id);
      } catch (err) {
        console.warn("[paybis.webhook] inventory release failed", err);
      }
      persisted = true;
      orderId = hit.id;
    }
  }

  return NextResponse.json({
    ok: true,
    received: {
      requestId: event.requestId,
      orderId,
      status: event.status,
    },
    persisted,
    persistenceMode: orders.mode,
    note:
      orders.mode === "cookie"
        ? "Cookie order jar cannot be mutated from webhooks; use database mode for live Paybis."
        : persisted
          ? "Order updated in commerce_orders."
          : "Signature verified; no matching pending order found.",
  });
}
