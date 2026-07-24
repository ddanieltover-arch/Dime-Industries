// components/assistant/assistant-chat.tsx
"use client";

import { useActionState } from "react";
import {
  submitAssistantMessage,
  type AssistantState,
} from "@/app/(marketing)/assistant-actions";

const initial: AssistantState = {};

const SUGGESTIONS = [
  "How do I validate my product?",
  "What's in Live Reserve?",
  "Where can I find DIME near me?",
  "How do Rewards work?",
];

export function AssistantChat() {
  const [state, formAction, pending] = useActionState(submitAssistantMessage, initial);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <form key={s} action={formAction}>
            <input type="hidden" name="message" value={s} />
            <button
              type="submit"
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-[var(--scale-xs)] text-[var(--color-ink-soft)] hover:border-[var(--color-resin)] hover:text-[var(--color-resin)]"
            >
              {s}
            </button>
          </form>
        ))}
      </div>

      {state.question && state.answer ? (
        <div className="mb-8 space-y-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <p className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-resin)]">
            You asked
          </p>
          <p className="text-[var(--color-ink)]">{state.question}</p>
          <p className="font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.14em] text-[var(--color-resin)]">
            Assistant {state.source === "live" ? "(live)" : "(guide)"}
          </p>
          <p className="leading-relaxed text-[var(--color-ink-soft)]">{state.answer}</p>
        </div>
      ) : null}

      {state.error ? (
        <p role="alert" className="mb-4 text-[var(--scale-sm)] text-[var(--color-flag)]">
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="assistant-message" className="sr-only">
          Your question
        </label>
        <input
          id="assistant-message"
          name="message"
          required
          placeholder="Ask about products, validation, stores…"
          className="flex-1 rounded-full border border-[var(--color-border-interactive)] bg-[var(--color-surface)] px-5 py-3 text-[var(--scale-sm)] text-[var(--color-ink)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--color-resin)] px-8 py-3 font-[var(--font-display)] text-[var(--scale-xs)] uppercase tracking-[0.16em] text-black hover:bg-[var(--color-resin-hover)] disabled:opacity-60"
        >
          {pending ? "Thinking…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
