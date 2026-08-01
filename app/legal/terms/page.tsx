// app/legal/terms/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getCmsPage } from "@/lib/cms/store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of use for the DIME Industries storefront — age requirements, orders, and accounts.",
  alternates: { canonical: "/legal/terms" },
};

export default async function TermsPage() {
  const page = await getCmsPage("legal/terms");
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      intro="Rules for using the DIME storefront — age eligibility, orders, accounts, and updates."
      body={page.body}
      currentHref="/legal/terms"
    />
  );
}
