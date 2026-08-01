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
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <form key={s} action={formAction}>
            <input type="hidden" name="message" value={s} />
            <button
              type="submit"
              disabled={pending}
              className="border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 font-[var(--font-display)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-soft)] transition-[border-color,color,background-color] duration-[var(--motion-fast)] hover:border-[var(--color-resin)] hover:text-[var(--color-resin)] disabled:opacity-60"
            >
              {s}
            </button>
          </form>
        ))}
      </div>

      {state.question && state.answer ? (
        <div className="mb-8 space-y-4 border border-[var(--color-border)] bg-[var(--color-bg)] p-5 sm:p-6">
          <div>
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              You asked
            </p>
            <p className="mt-2 text-[var(--color-ink)]">{state.question}</p>
          </div>
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
              Assistant {state.source === "live" ? "(live)" : "(guide)"}
            </p>
            <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{state.answer}</p>
          </div>
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
          className="field-input flex-1"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending ? "Thinking…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
