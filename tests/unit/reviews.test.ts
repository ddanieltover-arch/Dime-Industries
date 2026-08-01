import { describe, expect, it } from "vitest";
import {
  averageRating,
  filterApprovedForProduct,
  maskReviewAuthor,
  type ProductReview,
} from "@/lib/reviews/logic";

const base: ProductReview = {
  id: "r1",
  productId: "p-banana-mac",
  productSlug: "banana-mac",
  productName: "Banana Mac",
  authorEmail: "alex@example.com",
  rating: 5,
  body: "Great",
  status: "approved",
  createdAt: "2026-07-10T12:00:00.000Z",
};

describe("product reviews", () => {
  it("only returns approved reviews for the matching product", () => {
    const reviews: ProductReview[] = [
      base,
      { ...base, id: "r2", status: "pending" },
      { ...base, id: "r3", productId: "other", productSlug: "other", status: "approved" },
      {
        ...base,
        id: "r4",
        productId: "x",
        productSlug: "banana-mac",
        rating: 4,
        createdAt: "2026-07-11T12:00:00.000Z",
      },
    ];
    const approved = filterApprovedForProduct(reviews, {
      id: "p-banana-mac",
      slug: "banana-mac",
    });
    expect(approved.map((r) => r.id)).toEqual(["r4", "r1"]);
  });

  it("averages ratings to one decimal", () => {
    expect(averageRating([{ rating: 5 }, { rating: 4 }])).toBe(4.5);
    expect(averageRating([])).toBeNull();
  });

  it("masks author emails", () => {
    expect(maskReviewAuthor("alex@example.com")).toBe("a***@example.com");
  });
});
