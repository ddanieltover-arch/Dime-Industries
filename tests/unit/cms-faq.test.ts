import { describe, expect, it } from "vitest";
import {
  buildFaqPageJsonLd,
  parseBlogFaqSection,
  parseFaqEntries,
} from "../../lib/cms/faq";
import { parseCmsInline, renderCmsBody } from "../../lib/cms/render";

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
      "https://www.dimeindustries.us/faq"
    );
    expect(json["@type"]).toBe("FAQPage");
    expect(json.mainEntity).toHaveLength(1);
    expect(json.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: "Q?",
      acceptedAnswer: { "@type": "Answer", text: "A." },
    });
  });

  it("parses only the blog FAQ section", () => {
    const body = `Intro paragraph.

### How many dimes are in a standard roll?

Forty coins.

### Frequently asked questions

### How much money is in a roll of dimes?

$4.00 in face value.

### Are dime rolls the same at every bank?

Yes for face-value packaging.`;

    expect(parseBlogFaqSection(body)).toEqual([
      {
        question: "How much money is in a roll of dimes?",
        answer: "$4.00 in face value.",
      },
      {
        question: "Are dime rolls the same at every bank?",
        answer: "Yes for face-value packaging.",
      },
    ]);
  });
});

describe("CMS inline links", () => {
  it("parses markdown links with site paths", () => {
    expect(parseCmsInline("See [DIME carts](/shop/vapes) today.")).toEqual([
      { type: "text", text: "See " },
      { type: "link", text: "DIME carts", href: "/shop/vapes" },
      { type: "text", text: " today." },
    ]);
  });

  it("renders ### headings and paragraphs", () => {
    const blocks = renderCmsBody("### Hello\n\nWorld");
    expect(blocks).toEqual([
      { type: "h3", text: "Hello" },
      { type: "p", text: "World" },
    ]);
  });
});
