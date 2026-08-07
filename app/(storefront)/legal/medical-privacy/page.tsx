// app/legal/medical-privacy/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getCmsPage } from "@/lib/cms/store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Medical Privacy Policy",
  description: "How DIME handles medical patient information if medical flows are enabled — access, retention, and launch status.",
  alternates: { canonical: "/legal/medical-privacy" },
};

export default async function MedicalPrivacyPage() {
  const page = await getCmsPage("legal/medical-privacy");
  if (!page) notFound();

  return (
    <LegalDocument
      title={page.title}
      intro="How medical patient data is treated if medical flows are enabled — and what applies at the flat 21+ launch gate."
      body={page.body}
      currentHref="/legal/medical-privacy"
    />
  );
}
