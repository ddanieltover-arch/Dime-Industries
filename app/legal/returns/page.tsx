// app/legal/returns/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getCmsPage } from "@/lib/cms/store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Returns Policy",
  description: "How to request returns or exchanges for eligible DIME hardware purchases.",
  alternates: { canonical: "/legal/returns" },
};

export default async function ReturnsPage() {
  const page = await getCmsPage("legal/returns");
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      intro="Eligibility, how to submit a return request, and how to reach support for policy questions."
      body={page.body}
      currentHref="/legal/returns"
    />
  );
}
