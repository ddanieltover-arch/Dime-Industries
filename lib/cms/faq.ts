// lib/cms/faq.ts — FAQ is one CMS page (`/faq`); parse Q&A from ### headings (no FAQ CRUD).
import { renderCmsBody } from "./render";

export type FaqEntry = {
  question: string;
  answer: string;
};

/**
 * Pair ### headings with answers.
 * Supports both:
 * - `### Q\nAnswer` in one block (CMS seed style)
 * - `### Q\n\nAnswer` across blocks
 */
export function parseFaqEntries(body: string): FaqEntry[] {
  const blocks = renderCmsBody(body);
  const entries: FaqEntry[] = [];
  let current: FaqEntry | null = null;

  for (const block of blocks) {
    if (block.type === "h3") {
      if (current && current.answer.trim()) entries.push(current);
      const lines = block.text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
      const question = lines[0] ?? "";
      const inlineAnswer = lines.slice(1).join(" ");
      current = { question, answer: inlineAnswer };
      continue;
    }
    if (!current) continue;
    current.answer = current.answer
      ? `${current.answer} ${block.text.trim()}`
      : block.text.trim();
  }
  if (current && current.question && current.answer.trim()) entries.push(current);
  return entries.filter((e) => e.question && e.answer);
}

export function buildFaqPageJsonLd(entries: FaqEntry[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: pageUrl,
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export const FAQ_CMS_SLUG = "faq";
