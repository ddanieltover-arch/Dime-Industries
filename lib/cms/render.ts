// lib/cms/render.ts
/** Very small CMS body renderer: paragraphs split on blank lines; ### headings. */

export type CmsBlock =
  | { type: "h3"; text: string }
  | { type: "p"; text: string };

export type CmsInlinePart =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string };

export function renderCmsBody(body: string): CmsBlock[] {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) return { type: "h3" as const, text: block.slice(4) };
      return { type: "p" as const, text: block.replace(/\n/g, " ") };
    });
}

/** Parse simple markdown links `[label](/path)` inside a CMS paragraph. */
export function parseCmsInline(text: string): CmsInlinePart[] {
  const parts: CmsInlinePart[] = [];
  const re = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", text: text.slice(last, match.index) });
    }
    parts.push({ type: "link", text: match[1], href: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts.length ? parts : [{ type: "text", text }];
}
