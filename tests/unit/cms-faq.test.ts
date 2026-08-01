import { describe, expect, it } from "vitest";
import { buildFaqPageJsonLd, parseFaqEntries } from "@/lib/cms/faq";

describe("CMS FAQ page (single document)", () => {
  it("parses ### question + answer blocks", () => {
    const body =
      "### What is DIME?\nA licensed cannabis brand.\n\n### Where do you sell?\nCalifornia and Massachusetts.";
    expect(parseFaqEntries(body)).toEqual([
      { question: "What is DIME?", answer: "A licensed cannabis brand." },
      { question: "Where do you sell?", answer: "California and Massachusetts." },
    ]);
  });

  it("builds FAQPage JSON-LD", () => {
    const json = buildFaqPageJsonLd(
      [{ question: "Q?", answer: "A." }],
      "https://dimeindustries.us/faq"
    );
    expect(json["@type"]).toBe("FAQPage");
    expect(json.mainEntity).toHaveLength(1);
    expect(json.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: "Q?",
      acceptedAnswer: { "@type": "Answer", text: "A." },
    });
  });
});
