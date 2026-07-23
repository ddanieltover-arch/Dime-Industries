// app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dimeindustries.us"),
  title: { default: "DIME Industries", template: "%s | DIME" },
  description:
    "Award-winning cannabis vapes, edibles, and prerolls. Lab-tested. Licensed in California and Massachusetts.",
  openGraph: {
    type: "website",
    siteName: "DIME Industries",
    title: "DIME Industries",
    description: "Elevate your experience with award-winning DIME products.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
