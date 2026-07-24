// app/(marketing)/assistant-actions.ts
"use server";

import { askAssistant } from "@/lib/integrations/assistant/client";

export type AssistantState = {
  error?: string;
  answer?: string;
  source?: "live" | "mock";
  question?: string;
};

export async function submitAssistantMessage(
  _prev: AssistantState,
  formData: FormData
): Promise<AssistantState> {
  const question = String(formData.get("message") ?? "").trim();
  if (!question) return { error: "Enter a question." };
  const reply = await askAssistant(question);
  return { answer: reply.answer, source: reply.source, question };
}
