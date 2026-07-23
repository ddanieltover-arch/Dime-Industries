// app/layout.tsx
import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display-family", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body-family", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-family", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://dimeindustries.us"),
  title: { default: "DIME Enterprise Commerce", template: "%s | DIME" },
  description:
    "Lab-tested vapes, edibles, and prerolls. Every batch published with its certificate of analysis. Licensed in California and Massachusetts.",
  openGraph: {
    type: "website",
    siteName: "DIME Enterprise Commerce",
    title: "DIME Enterprise Commerce",
    description: "Lab-tested cannabis products, potency-first. Licensed in California and Massachusetts.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
        <ThemeProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
