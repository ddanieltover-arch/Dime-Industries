// components/legal/legal-document.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { renderCmsBody } from "@/lib/cms/render";

export const LEGAL_NAV = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie preferences" },
  { href: "/legal/returns", label: "Returns" },
  { href: "/legal/medical-privacy", label: "Medical Privacy" },
] as const;

export function LegalDocument({
  title,
  intro,
  body,
  currentHref,
  children,
}: {
  title: string;
  intro: string;
  body?: string;
  currentHref: string;
  children?: ReactNode;
}) {
  const blocks = body ? renderCmsBody(body) : [];

  return (
    <>
      <section className="relative isolate min-h-[min(48vh,420px)] overflow-hidden">
        <Image
          src="/brand/concrete.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(14,14,14,0.95)_0%,rgba(14,14,14,0.6)_50%,rgba(14,14,14,0.45)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(201,177,56,0.1),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(48vh,420px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-12 pt-28 sm:pb-14 sm:pt-32">
          <p className="section-eyebrow">DIME</p>
          <h1 className="mt-2 max-w-2xl font-[var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-[var(--scale-base)] leading-relaxed text-white/80">{intro}</p>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-5">
          <nav aria-label="Legal pages">
            <ul className="flex flex-wrap gap-x-6 gap-y-2" role="list">
              {LEGAL_NAV.map((item) => {
                const active = item.href === currentHref;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] transition-colors duration-[var(--motion-fast)] ${
                        active
                          ? "text-[var(--color-resin)]"
                          : "text-[var(--color-ink-soft)] hover:text-[var(--color-resin)]"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      <section className="bg-[var(--color-bg)]">
        <div className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          {children ?? (
            <div className="space-y-4">
              {blocks.map((block, i) =>
                block.type === "h3" ? (
                  <h2
                    key={i}
                    className="pt-6 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-resin)] first:pt-0"
                  >
                    {block.text}
                  </h2>
                ) : (
                  <p key={i} className="text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
                    {block.text}
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Questions?
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Contact support@dimeindustries.us
            </p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0">
            Contact
          </Link>
        </div>
      </section>
    </>
  );
}
