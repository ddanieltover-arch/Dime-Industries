// app/assistant/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AssistantChat } from "@/components/assistant/assistant-chat";

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Ask DIME about products, validation, lab results, rewards, and stores.",
  alternates: { canonical: "/assistant" },
};

const TOPICS = [
  {
    title: "Products & lines",
    body: "Signature, Live Reserve, Rosin, edibles — what to shop and where it lives in the catalog.",
    href: "/shop",
    label: "Browse shop",
  },
  {
    title: "Validate & warranty",
    body: "How to scratch your code, confirm authenticity, and unlock limited warranty coverage.",
    href: "/validate",
    label: "Validate",
  },
  {
    title: "Labs, rewards, stores",
    body: "COA lookups, points, and finding a neighborhood retailer near you.",
    href: "/locations",
    label: "Find DIME",
  },
] as const;

export default function AssistantPage() {
  return (
    <>
      <section className="relative isolate min-h-[min(58vh,520px)] overflow-hidden">
        <Image
          src="/brand/concrete.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_35%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(14,14,14,0.94)_0%,rgba(14,14,14,0.55)_45%,rgba(14,14,14,0.4)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(201,177,56,0.14),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(58vh,520px)] max-w-7xl flex-col justify-end px-[var(--container-pad-x)] pb-12 pt-28 sm:pb-16 sm:pt-32">
          <p className="section-eyebrow rise">DIME</p>
          <h1 className="rise rise-delay-1 mt-2 max-w-xl font-[var(--font-display)] text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-[0.95] tracking-[0.06em] text-white">
            AI Assistant
          </h1>
          <p className="rise rise-delay-2 mt-4 max-w-md text-[var(--scale-base)] leading-relaxed text-white/80">
            Your on-site budtender for product lines, authenticity, lab results, and finding DIME.
          </p>
          <div className="rise rise-delay-3 mt-8 flex flex-wrap gap-3">
            <a href="#assistant-chat" className="btn-primary">
              Ask a question
            </a>
            <Link href="/faq" className="btn-outline-light">
              View FAQ
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="topics-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
            What I can help with
          </p>
          <h2 id="topics-heading" className="section-title mt-2">
            Ask about DIME
          </h2>
          <p className="mt-3 max-w-lg text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
            Start with a topic — or type any question in the chat below.
          </p>

          <ul className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-3" role="list">
            {TOPICS.map((topic) => (
              <li key={topic.title} className="bg-[var(--color-bg)] p-6 sm:p-8">
                <h3 className="font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
                  {topic.title}
                </h3>
                <p className="mt-3 text-[var(--scale-sm)] leading-relaxed text-[var(--color-ink-soft)]">
                  {topic.body}
                </p>
                <Link
                  href={topic.href}
                  className="mt-6 inline-block font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)] transition-colors duration-[var(--motion-fast)] hover:text-[var(--color-resin-hover)]"
                >
                  {topic.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="assistant-chat"
        aria-labelledby="chat-heading"
        className="scroll-mt-24 bg-[var(--color-bg)]"
      >
        <div className="mx-auto max-w-7xl px-[var(--container-pad-x)] py-[var(--section-y)]">
          <div className="mx-auto max-w-3xl">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Chat
            </p>
            <h2 id="chat-heading" className="section-title mt-2">
              Ask anything
            </h2>
            <p className="mt-3 text-[var(--scale-sm)] text-[var(--color-ink-soft)]">
              Tap a suggestion or type your own question. For account issues, contact support directly.
            </p>

            <div className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-8">
              <AssistantChat />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-[var(--container-pad-x)] py-12 sm:flex-row sm:items-center">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.18em] text-[var(--color-resin)]">
              Prefer a human?
            </p>
            <p className="mt-2 max-w-xl font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.06em] text-[var(--color-ink)]">
              Reach the DIME support team
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
