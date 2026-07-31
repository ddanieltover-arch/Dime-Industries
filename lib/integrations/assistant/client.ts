// lib/integrations/assistant/client.ts
import "server-only";
import { SEED_CATALOG } from "@/lib/catalog/seed-catalog";
import { resolveAssistantApiBase } from "@/lib/integrations/hosts";

export type AssistantReply = {
  answer: string;
  source: "live" | "mock";
};

function assistantConfigured() {
  return Boolean(resolveAssistantApiBase());
}

function mockAnswer(message: string, catalogSizeByLine: Record<string, number>): string {
  const q = message.toLowerCase();
  if (/validat|authentic|counterfeit|warranty/.test(q)) {
    return "Scratch the code on your package and enter it at /validate. That confirms authenticity and unlocks limited warranty plus rewards when you are signed in.";
  }
  if (/reward|points|loyalty/.test(q)) {
    return "DIME Rewards lets you earn points for validating products and shopping. Visit /rewards or /account/loyalty after you sign up.";
  }
  if (/store|retail|locator|near me|find/.test(q)) {
    return "Use Find DIME at /locations to browse by state. Online shopping and delivery are available in California and Massachusetts.";
  }
  if (/coa|lab|test|potency/.test(q)) {
    return "Look up certificates of analysis at /lab-results by SKU or product name. Product pages also link to lab results.";
  }
  if (/battery|510|tank/.test(q)) {
    return "Most 510 batteries work with DIME tanks, but air-draw batteries without a button and weak batteries under 3.7v often fail. Shop Accessories for DIME 5th Gen batteries.";
  }
  if (/live reserve|signature|rosin|collab/.test(q)) {
    const line = /live reserve/.test(q)
      ? "live-reserve"
      : /rosin/.test(q)
        ? "rosin"
        : /collab/.test(q)
          ? "collabs"
          : "signature";
    const count =
      catalogSizeByLine[line] ?? SEED_CATALOG.filter((p) => p.lineSlug === line).length;
    return `We carry ${count} products in that line. Browse /shop/vapes/${line} to see the full assortment.`;
  }
  if (/edible|gumm|softgel/.test(q)) {
    return "Shop edibles at /shop/edibles — Balanced and Rosin gummies plus Softgels (morning, afternoon, evening).";
  }
  return "I can help with products, validation, lab results, rewards, and finding DIME near you. Try asking about a line (Signature, Live Reserve), Validate, or Find DIME. For account issues, contact support@dimeindustries.us.";
}

async function postChat(
  base: string,
  path: string,
  message: string
): Promise<string | null> {
  const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
  if (url.origin !== new URL(base).origin) return null;

  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const key = process.env.ASSISTANT_API_KEY?.trim();
  if (key) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ message }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { answer?: string; reply?: string; message?: string };
  const text = (data.answer || data.reply || data.message || "").trim();
  return text || null;
}

export async function askAssistant(message: string): Promise<AssistantReply> {
  const trimmed = message.trim().slice(0, 1000);
  if (!trimmed) {
    return { answer: "Ask me about DIME products, validation, lab results, or stores.", source: "mock" };
  }

  const base = resolveAssistantApiBase();
  if (base) {
    try {
      // DIME Budtender Heroku uses POST /chat → { reply }; generic contract uses /v1/chat → { answer }.
      for (const path of ["/chat", "/v1/chat"]) {
        const text = await postChat(base, path, trimmed);
        if (text) return { answer: text, source: "live" };
      }
    } catch (err) {
      console.warn("[assistant] live fetch failed", err);
    }
  }

  try {
    const { loadEffectiveCatalog } = await import("@/lib/catalog/effective");
    const catalog = await loadEffectiveCatalog();
    const byLine: Record<string, number> = {};
    for (const p of catalog) {
      if (!p.lineSlug) continue;
      byLine[p.lineSlug] = (byLine[p.lineSlug] ?? 0) + 1;
    }
    return { answer: mockAnswer(trimmed, byLine), source: "mock" };
  } catch {
    return { answer: mockAnswer(trimmed, {}), source: "mock" };
  }
}

export function getAssistantIntegrationStatus() {
  const base = resolveAssistantApiBase();
  return {
    configured: Boolean(base),
    mode: base ? ("live" as const) : ("mock" as const),
    base: base ?? null,
  };
}
