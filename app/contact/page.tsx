// app/contact/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the DIME team for order help, wholesale questions, careers, or general support at support@dimeindustries.us.",
  alternates: { canonical: "/contact" },
};

const SUPPORT = "support@dimeindustries.us";

const CHANNELS = [
  {
    title: "Email",
    body: "Orders, wholesale, privacy, and careers — one inbox for the DIME team.",
    href: `mailto:${SUPPORT}`,
    label: SUPPORT,
    external: true,
  },
  {
    title: "Wholesale",
    body: "Apply for B2B pricing with NET-30, NET-60, or Bitcoin upfront terms.",
    href: "/wholesale",
    label: "Apply for wholesale",
    external: false,
  },
  {
    title: "Validate",
    body: "Authenticity and warranty start with your package code — not the contact form.",
    href: "/validate",
    label: "Validate a product",
    external: false,
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <section className="relative isolate min-h-[min(58vh,520px)] overflow-hidden">
        <Image
          src="/brand/concrete.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_40%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(14,14,14,0.94)_0%,rgba(14,14,14,0.55)_45%,rgba(14,14,14,0.4)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(201,177,56,0.12),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(58vh,520px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-12 pt-28 sm:pb-16 sm:pt-32">
          <p className="section-eyebrow contact-rise">DIME</p>
          <h1 className="contact-rise mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-[0.06em] text-white [animation-delay:80ms]">
            Contact
          </h1>
          <p className="contact-rise mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80 [animation-delay:140ms]">
            Inquiries and support for orders, wholesale, careers, and privacy — one inbox for the DIME team.
          </p>
          <div className="contact-rise mt-8 flex flex-wrap gap-3 [animation-delay:200ms]">
            <a href="#contact-form" className="btn-primary">
              Send a message
            </a>
            <Link href="/locations" className="btn-outline-light">
              Find DIME
            </Link>
            <Link href="/validate" className="btn-outline-light">
              Validate
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="channels-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            Reach us
          </p>
          <h2 id="channels-heading" className="section-title mt-2">
            Ways to get help
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Pick the fastest path — include your order ID for order issues.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {CHANNELS.map((channel) => (
              <li key={channel.title} className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {channel.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                  {channel.body}
                </p>
                {channel.external ? (
                  <a
                    href={channel.href}
                    className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
                  >
                    {channel.label} →
                  </a>
                ) : (
                  <Link
                    href={channel.href}
                    className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
                  >
                    {channel.label} →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="contact-form"
        aria-labelledby="contact-form-heading"
        className="scroll-mt-24 bg-[var(--color-bg)]"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-[var(--container-pad-x)] py-[var(--section-y)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Message
            </p>
            <h2 id="contact-form-heading" className="section-title mt-2">
              Send a message
            </h2>
            <p className="mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
              We reply from {SUPPORT}. For authenticity or warranty, use{" "}
              <Link href="/validate" className="text-[var(--color-ink)] underline-offset-4 hover:underline">
                Validate
              </Link>{" "}
              with your package code first.
            </p>
            <p className="mt-6 text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              Prefer email?{" "}
              <a
                href={`mailto:${SUPPORT}`}
                className="text-[var(--color-resin)] underline-offset-4 hover:underline"
              >
                {SUPPORT}
              </a>
            </p>
          </div>

          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Looking for answers?
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Check the FAQ before you write
            </p>
          </div>
          <Link href="/faq" className="btn-primary shrink-0">
            View FAQ
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes contact-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .contact-rise {
          animation: contact-rise 0.7s var(--ease-out) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .contact-rise { animation: none !important; }
        }
      `}</style>
    </>
  );
}
