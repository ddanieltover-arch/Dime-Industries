// app/checkout/bitcoin/[orderId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BitcoinPaidButton } from "@/components/checkout/bitcoin-paid-button";
import { CopyWalletButton } from "@/components/checkout/copy-wallet-button";
import { getOrderById } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { getCryptoWallets } from "@/lib/payments/methods";

export const metadata: Metadata = {
  title: "Pay with crypto",
  robots: { index: false, follow: false },
};

type Params = Promise<{ orderId: string }>;

export default async function BitcoinPaymentPage({ params }: { params: Params }) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();
  if (order.paymentMethod !== "paybis_btc") notFound();

  const wallets = getCryptoWallets();
  const btcWallet = wallets.find((w) => w.network === "btc")!;
  const paid = order.status === "payment_confirmed";

  return (
    <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-14 lg:py-20">
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
        {paid ? "Payment confirmed" : "Crypto payment"}
      </p>
      <h1 className="section-title mt-3">
        {paid ? "Thank you" : "How to pay with crypto"}
      </h1>
      <p className="mt-4 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
        Order <span className="text-[var(--color-ink)]">{order.id}</span>
        {paid
          ? " is confirmed."
          : ` · Send exactly ${formatPrice(order.totalCents)} in BTC, ETH, or BCH to one of the wallets below.`}
      </p>

      {!paid ? (
        <>
          <section className="mt-10 space-y-4">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Our wallets
            </p>
            {wallets.map((wallet) => (
              <div
                key={wallet.network}
                className="border border-[var(--color-resin)] bg-[rgba(201,177,56,0.08)] p-5 sm:p-6"
              >
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                  {wallet.label}
                </p>
                <p className="mt-3 break-all font-[var(--font-mono)] text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink)] sm:text-[var(--scale-base)]">
                  {wallet.address}
                </p>
                <div className="mt-4">
                  <CopyWalletButton address={wallet.address} />
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href={`/checkout/confirmation/${order.id}`} className="btn-outline">
                View order
              </Link>
            </div>
            <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              Amount due:{" "}
              <span className="text-[var(--color-resin)]">{formatPrice(order.totalCents)}</span>
              . Send on the matching network only (BTC → Bitcoin, ETH → Ethereum, BCH → Bitcoin
              Cash). Network fees are paid by you — cover the full order total.
            </p>
          </section>

          <div className="mt-6">
            <BitcoinPaidButton orderId={order.id} />
          </div>

          <section className="mt-12 space-y-8">
            <div>
              <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                Pay with card via Paybis
              </h2>
              <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                Paying with a credit or debit card is one of the fastest ways to complete your order.
                We use{" "}
                <a
                  href="https://paybis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-resin)] underline-offset-4 hover:underline"
                >
                  Paybis
                </a>
                , a secure third-party platform, so you can buy crypto with a card and send it to
                our wallet. DIME never stores your card information. Bitcoin (BTC) is the simplest
                path on Paybis; you may also send ETH or BCH from your own wallet.
              </p>
            </div>

            <ol className="space-y-6">
              <li className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                  Step 1 — Your order is ready
                </p>
                <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  You’ve already created order{" "}
                  <span className="text-[var(--color-ink)]">{order.id}</span>. Keep this page open
                  (or your confirmation email) for the wallet addresses and total.
                </p>
              </li>

              <li className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                  Step 2 — Buy Bitcoin on Paybis
                </p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  <li>
                    Open{" "}
                    <a
                      href="https://paybis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-resin)] underline-offset-4 hover:underline"
                    >
                      paybis.com
                    </a>{" "}
                    and start a Bitcoin purchase.
                  </li>
                  <li>Enter the exact total shown on this order ({formatPrice(order.totalCents)}).</li>
                  <li>Click Buy Bitcoin and verify your email and phone if prompted.</li>
                  <li>
                    Choose your preferred method: credit card, debit card, Apple Pay, or Google Pay.
                  </li>
                </ol>
              </li>

              <li className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                  Step 3 — Send to our wallet
                </p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  <li>When asked for a destination wallet, select External Wallet.</li>
                  <li>
                    Paste our Bitcoin (BTC) address:{" "}
                    <span className="break-all font-[var(--font-mono)] text-[var(--color-ink)]">
                      {btcWallet.address}
                    </span>
                  </li>
                  <li>Confirm the transaction on Paybis.</li>
                </ol>
              </li>

              <li className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                  Step 4 — Verification
                </p>
                <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  Paybis may request a quick identity check — that’s their standard security process.
                  Watch your email and complete any prompts they send.
                </p>
              </li>

              <li className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                  Step 5 — Tell us you’ve paid
                </p>
                <p className="mt-2 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
                  After your send confirms, click{" "}
                  <strong className="text-[var(--color-ink)]">I have paid</strong> above. Our team
                  will verify the transfer and approve your order manually. Payments are usually
                  confirmed within about 30 minutes once the funds arrive.
                </p>
              </li>
            </ol>

            <div className="border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]">
                Is this safe?
              </p>
              <p className="mt-2">
                Card purchases go through Paybis. DIME never stores your card details. You only send
                crypto to the wallet addresses on this page.
              </p>
              <p className="mt-2">
                Need help? Contact{" "}
                <Link href="/contact" className="text-[var(--color-resin)] underline-offset-4 hover:underline">
                  support
                </Link>{" "}
                with your order ID.
              </p>
            </div>
          </section>
        </>
      ) : (
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href={`/checkout/confirmation/${order.id}`} className="btn-primary">
            View confirmation
          </Link>
          <Link href="/shop" className="btn-outline">
            Continue shopping
          </Link>
        </div>
      )}
    </div>
  );
}
