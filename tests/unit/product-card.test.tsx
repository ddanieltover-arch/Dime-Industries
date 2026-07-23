import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "../../components/catalog/product-card";
import type { ProductCardModel } from "../../lib/catalog/types";

const product: ProductCardModel = {
  slug: "live-reserve-gelato-1g",
  name: "Gelato Cartridge",
  line: "Live Reserve",
  strainType: "hybrid",
  weightOrFormat: "1g",
  retailPriceCents: 4500,
  thcPct: 82.5,
  cbdPct: 0.2,
  variantCount: 1,
};

describe("ProductCard", () => {
  it("renders product name, price, and always-visible potency", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText("Gelato Cartridge")).toBeInTheDocument();
    expect(screen.getByText("$45.00")).toBeInTheDocument();
    expect(screen.getByText("82.5%")).toBeInTheDocument();
    expect(screen.getByText("0.2%")).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
  });

  it("links to the correct product detail route", () => {
    render(<ProductCard product={product} />);
    const link = screen.getByRole("link", { name: /Gelato Cartridge/ });
    expect(link).toHaveAttribute("href", "/product/live-reserve-gelato-1g");
  });

  it("shows From prefix when multiple variants exist", () => {
    render(<ProductCard product={{ ...product, variantCount: 2 }} />);
    expect(screen.getByText(/From \$45\.00/)).toBeInTheDocument();
  });
});
