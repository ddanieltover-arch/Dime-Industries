import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "../../components/catalog/product-card";
import type { ProductCardModel } from "../../lib/catalog/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("../../app/(commerce)/cart-actions", () => ({
  addItemToCart: vi.fn(),
}));

const product: ProductCardModel = {
  slug: "miami-ice",
  name: "Miami Ice",
  line: "Live Reserve",
  strainType: "hybrid",
  weightOrFormat: "1g cartridge",
  retailPriceCents: 4500,
  thcPct: 82.5,
  cbdPct: 0.2,
  variantCount: 1,
  primaryVariantId: "var-miami-ice-1g",
  inStock: true,
  imageUrl: null,
  primarySku: "LR-MIAMI-ICE-1G",
  coaUrl: null,
  coaLive: false,
  isBundle: false,
  compareAtPriceCents: null,
};

describe("ProductCard", () => {
  it("renders product name, price, and always-visible potency", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText("Miami Ice")).toBeInTheDocument();
    expect(screen.getByText("$45.00")).toBeInTheDocument();
    expect(screen.getByText(/THC 82\.5%/)).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
  });

  it("links to the correct product detail route", () => {
    render(<ProductCard product={product} />);
    const link = screen.getByRole("link", { name: /Miami Ice/ });
    expect(link).toHaveAttribute("href", "/product/miami-ice");
  });

  it("shows From prefix when multiple variants exist", () => {
    render(<ProductCard product={{ ...product, variantCount: 2 }} />);
    expect(screen.getByText(/From \$45\.00/)).toBeInTheDocument();
  });

  it("shows add to cart for single-variant products", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole("button", { name: /Add Miami Ice to cart/i })).toBeInTheDocument();
  });

  it("shows select options for multi-variant products", () => {
    render(<ProductCard product={{ ...product, variantCount: 2 }} />);
    expect(screen.getByRole("link", { name: /Select options/i })).toHaveAttribute(
      "href",
      "/product/miami-ice"
    );
  });

  it("shows out of stock when unavailable", () => {
    render(<ProductCard product={{ ...product, inStock: false }} />);
    expect(screen.getByText(/Out of stock/i)).toBeInTheDocument();
  });

  it("shows Live COA badge when coaLive is true", () => {
    render(
      <ProductCard
        product={{
          ...product,
          coaUrl: "https://example.com/coa",
          coaLive: true,
        }}
      />
    );
    const badge = screen.getByRole("link", { name: /View live lab COA/i });
    expect(badge).toHaveAttribute("href", "/lab-results?sku=LR-MIAMI-ICE-1G");
  });

  it("hides Live COA badge when not live", () => {
    render(<ProductCard product={product} />);
    expect(screen.queryByRole("link", { name: /View live lab COA/i })).not.toBeInTheDocument();
  });
});