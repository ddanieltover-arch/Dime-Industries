// app/assistant/page.tsx
import type { Metadata } from "next";
import { AssistantChat } from "@/components/assistant/assistant-chat";

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Ask DIME about products, validation, lab results, rewards, and stores.",
  alternates: { canonical: "/assistant" },
};

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-[var(--font-display)] text-[var(--scale-2xl)] uppercase tracking-[0.08em] text-[var(--color-ink)]">
          AI Assistant
        </h1>
        <p className="mt-3 text-[var(--scale-base)] text-[var(--color-ink-soft)]">
          Your on-site budtender for product lines, authenticity, lab results, and finding DIME.
        </p>
      </div>
      <div className="mt-10">
        <AssistantChat />
      </div>
    </div>
  );
}
