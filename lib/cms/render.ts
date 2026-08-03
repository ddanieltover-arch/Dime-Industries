// lib/cms/render.ts
/** Very small CMS body renderer: paragraphs, ### headings, GFM-style tables. */

export type CmsBlock =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type CmsInlinePart =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string };

function parseTableBlock(block: string): CmsBlock | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  if (!lines.every((l) => l.startsWith("|") && l.endsWith("|"))) return null;

  const splitRow = (line: string) =>
    line
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());

  const headers = splitRow(lines[0]!);
  const maybeSep = lines[1]!;
  const sepCells = splitRow(maybeSep);
  const isSeparator = sepCells.every((c) => /^:?-{3,}:?$/.test(c));
  const dataLines = isSeparator ? lines.slice(2) : lines.slice(1);
  if (!dataLines.length) return null;

  const rows = dataLines.map(splitRow).filter((r) => r.some((c) => c.length > 0));
  if (!rows.length) return null;
  return { type: "table", headers, rows };
}

export function renderCmsBody(body: string): CmsBlock[] {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) return { type: "h3" as const, text: block.slice(4) };
      const table = parseTableBlock(block);
      if (table) return table;
      return { type: "p" as const, text: block.replace(/\n/g, " ") };
    });
}

/** Parse markdown links `[label](/path)` or `[label](https://...)` inside CMS text. */
export function parseCmsInline(text: string): CmsInlinePart[] {
  const parts: CmsInlinePart[] = [];
  const re = /\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", text: text.slice(last, match.index) });
    }
    parts.push({ type: "link", text: match[1]!, href: match[2]! });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts.length ? parts : [{ type: "text", text }];
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
