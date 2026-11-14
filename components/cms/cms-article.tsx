// components/cms/cms-article.tsx
import Link from "next/link";
import { parseCmsInline, renderCmsBody } from "@/lib/cms/render";

function CmsParagraph({ text }: { text: string }) {
  const parts = parseCmsInline(text);
  return (
    <p className="text-[var(--scale-base)] leading-relaxed text-[var(--color-ink-soft)]">
      {parts.map((part, i) =>
        part.type === "link" ? (
          <Link key={i} href={part.href} className="prose-link">
            {part.text}
          </Link>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  );
}

export function CmsArticle({
  title,
  body,
  showTitle = true,
}: {
  title?: string;
  body: string;
  showTitle?: boolean;
}) {
  const blocks = renderCmsBody(body);
  return (
    <>
      {showTitle && title ? (
        <section className="page-header">
          <div className="mx-auto max-w-7xl px-[var(--container-pad-x)]">
            <p className="section-eyebrow">DIME</p>
            <h1 className="page-header-title">{title}</h1>
          </div>
        </section>
      ) : null}
      <article className="mx-auto max-w-3xl px-[var(--container-pad-x)] py-[var(--section-y)]">
        <div className={showTitle && title ? "space-y-4" : "space-y-4"}>
          {blocks.map((block, i) => {
            if (block.type === "h3") {
              return (
                <h2
                  key={i}
                  className="pt-4 font-[var(--font-display)] text-[var(--scale-lg)] uppercase tracking-[0.08em] text-[var(--color-ink)] first:pt-0"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "table") {
              return (
                <div key={i} className="overflow-x-auto">
                  <table className="w-full min-w-[20rem] border-collapse text-left text-[var(--scale-sm)]">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        {block.headers.map((h) => (
                          <th key={h} scope="col" className="section-eyebrow px-3 py-3 text-left">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-[var(--color-border)]">
                          {row.map((cell, ci) => (
                            <td key={`${ri}-${ci}`} className="px-3 py-3 text-[var(--color-ink-soft)]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            const isAnswerCapsule = block.text.startsWith("Quick Answer:");
            if (isAnswerCapsule) {
              return (
                <section key={i} id="answer" aria-label="Quick Answer">
                  <CmsParagraph text={block.text} />
                </section>
              );
            }

            return <CmsParagraph key={i} text={block.text} />;
          })}
        </div>
      </article>
    </>
  );
}