// app/legal/terms/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getCmsPage } from "@/lib/cms/store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for shopping on dimeindustries.us — eligibility, orders, accounts, validation, and rewards.",
  alternates: { canonical: "/legal/terms" },
};

export default async function TermsPage() {
  const page = await getCmsPage("legal/terms");
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      intro="Eligibility, orders, accounts, product validation, rewards, and your responsibilities on this Site."
      body={page.body}
      currentHref="/legal/terms"
    />
  );
}
