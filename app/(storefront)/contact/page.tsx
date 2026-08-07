// app/contact/page.tsx
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { BRAND_EMAIL, mailtoBrand } from "@/lib/brand/email";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.06em] text-[var(--color-ink)] sm:text-[var(--scale-3xl)]">
        Contact
      </h1>
      <p className="mt-4 max-w-xl text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
        Reach the DIME team for orders, wholesale, privacy, or general questions. We reply from{" "}
        {BRAND_EMAIL}.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        <aside className="space-y-6 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
          <div>
            <h2 className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)]">
              Email
            </h2>
            <p className="mt-2">
              <a
                href={mailtoBrand()}
                className="text-[var(--color-ink)] underline-offset-4 hover:underline"
              >
                {BRAND_EMAIL}
              </a>
            </p>
          </div>
          <div>
            <h2 className="font-[var(--font-display)] text-[var(--scale-sm)] uppercase tracking-[0.12em] text-[var(--color-resin)]">
              Wholesale
            </h2>
            <p className="mt-2">
              Email {BRAND_EMAIL}
              {" · "}
              <a href="/wholesale" className="text-[var(--color-ink)] underline-offset-4 hover:underline">
                Apply
              </a>
            </p>
          </div>
          <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
            Include your order ID for order issues. For authenticity or warranty, use{" "}
            <a href="/validate" className="underline underline-offset-4">
              Validate
            </a>{" "}
            with your package code.
          </p>
        </aside>

        <section aria-labelledby="contact-form-heading">
          <h2
            id="contact-form-heading"
            className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]"
          >
            Send a message
          </h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  );
}
