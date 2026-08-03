// components/blog/blog-article.tsx
import Link from "next/link";
import { isExternalHref, parseCmsInline, renderCmsBody } from "@/lib/cms/render";

function CmsLink({ href, text }: { href: string; text: string }) {
  const className =
    "text-[var(--color-resin)] underline-offset-4 hover:underline";
  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {text}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {text}
    </Link>
  );
}

function BlogParagraph({ text }: { text: string }) {
  const parts = parseCmsInline(text);
  return (
    <p className="text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
      {parts.map((part, i) =>
        part.type === "link" ? (
          <CmsLink key={i} href={part.href} text={part.text} />
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  );
}

export function BlogArticle({ body }: { body: string }) {
  const blocks = renderCmsBody(body);

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "h3") {
          return (
            <h2
              key={i}
              className="pt-6 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-resin)] first:pt-0"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "table") {
          return (
            <div key={i} className="overflow-x-auto pt-2">
              <table className="w-full min-w-[20rem] border-collapse text-left text-[var(--scale-sm)]">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {block.headers.map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-3 py-3 font-[var(--font-display)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-resin)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-[var(--color-border)]">
                      {row.map((cell, ci) => (
                        <td
                          key={`${ri}-${ci}`}
                          className="px-3 py-3 align-top leading-relaxed text-[var(--color-ink-soft)]"
                        >
                          {parseCmsInline(cell).map((part, pi) =>
                            part.type === "link" ? (
                              <CmsLink key={pi} href={part.href} text={part.text} />
                            ) : (
                              <span key={pi}>{part.text}</span>
                            )
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.text.startsWith("Quick Answer:")) {
          const answer = block.text.replace(/^Quick Answer:\s*/i, "");
          return (
            <aside
              key={i}
              id="answer"
              aria-label="Quick Answer"
              className="border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-resin)] bg-[var(--color-surface)] px-5 py-5 sm:px-6"
            >
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.16em] text-[var(--color-resin)]">
                Quick answer
              </p>
              <div className="mt-3">
                <BlogParagraph text={answer} />
              </div>
            </aside>
          );
        }

        return <BlogParagraph key={i} text={block.text} />;
      })}
    </div>
  );
}
