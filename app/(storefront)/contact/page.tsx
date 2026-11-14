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
    <>
      <section className="page-header">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
          <p className="section-eyebrow">Support</p>
          <h1 className="page-header-title">Contact</h1>
          <p className="page-header-lede">
            Reach the DIME team for orders, wholesale, privacy, or general questions. We reply from{" "}
            {BRAND_EMAIL}.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-[var(--section-y)]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <aside className="space-y-6 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            <div>
              <h2 className="section-eyebrow">Email</h2>
              <p className="mt-2">
                <a href={mailtoBrand()} className="prose-link">
                  {BRAND_EMAIL}
                </a>
              </p>
            </div>
            <div>
              <h2 className="section-eyebrow">Wholesale</h2>
              <p className="mt-2">
                Email {BRAND_EMAIL}
                {" · "}
                <a href="/wholesale" className="prose-link">
                  Apply
                </a>
              </p>
            </div>
            <p className="text-[var(--scale-xs)] text-[var(--color-ink-muted)]">
              Include your order ID for order issues. For authenticity or warranty, use{" "}
              <a href="/validate" className="prose-link">
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
    </>
  );
}