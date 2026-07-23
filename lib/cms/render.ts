// lib/cms/render.ts
/** Very small CMS body renderer: paragraphs split on blank lines; ### headings. */
export function renderCmsBody(body: string): { type: "h3" | "p"; text: string }[] {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) return { type: "h3" as const, text: block.slice(4) };
      return { type: "p" as const, text: block.replace(/\n/g, " ") };
    });
}
