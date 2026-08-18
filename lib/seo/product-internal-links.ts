// lib/seo/product-internal-links.ts — keyword-aware internal links on PDPs

export type ProductSeoLink = { href: string; label: string };

export function productSeoInternalLinks(input: {
  slug: string;
  lineSlug: string | null;
  categorySlug: string;
}): ProductSeoLink[] {
  const links: ProductSeoLink[] = [
    { href: "/shop/vapes", label: "Shop DIME carts & vapes" },
    { href: "/blog/what-is-a-dime-cart", label: "What is a Dime cart?" },
  ];

  if (input.lineSlug === "live-reserve") {
    links.push(
      { href: "/shop/vapes/live-reserve", label: "Shop Live Reserve" },
      { href: "/blog/dime-live-reserve-explained", label: "What is Live Reserve?" }
    );
  } else if (input.lineSlug === "signature") {
    links.push(
      { href: "/shop/vapes/signature", label: "Shop Signature" },
      { href: "/blog/signature-vs-balanced", label: "Signature vs Balanced" }
    );
  } else if (input.lineSlug === "balanced") {
    links.push(
      { href: "/shop/vapes/balanced", label: "Shop Balanced" },
      { href: "/blog/signature-vs-balanced", label: "Signature vs Balanced" }
    );
  } else if (input.lineSlug === "rosin") {
    links.push(
      { href: "/shop/vapes/rosin", label: "Shop DIME Rosin" },
      { href: "/glossary#rosin", label: "Glossary: Rosin" }
    );
  } else if (input.categorySlug === "edibles") {
    links.push(
      { href: "/shop/edibles", label: "Shop DIME edibles" },
      { href: "/blog/dime-gummies", label: "DIME gummies guide" }
    );
  } else {
    links.push({
      href: "/blog/dime-disposable-vapes",
      label: "DIME disposable vapes",
    });
  }

  links.push({ href: "/lab-results", label: "Lab results / COA" });
  return links.slice(0, 5);
}
