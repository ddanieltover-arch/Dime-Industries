// app/legal/returns/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getCmsPage } from "@/lib/cms/store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Returns Policy",
  description: "Returns and exchanges for eligible DIME hardware — online requests, retailer purchases, and warranty via Validate.",
  alternates: { canonical: "/legal/returns" },
};

export default async function ReturnsPage() {
  const page = await getCmsPage("legal/returns");
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      intro="What qualifies, how to request a return online or via a retailer, and how validation ties to warranty."
      body={page.body}
      currentHref="/legal/returns"
    />
  );
}
