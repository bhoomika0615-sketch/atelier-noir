import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "ATELIER NOIR — Modern Menswear",
  description: "A study in contemporary form, texture and individuality.",
  metadataBase: process.env.APP_URL ? new URL(process.env.APP_URL) : undefined,
  alternates: { canonical: "/" },
  openGraph: {
    title: "ATELIER NOIR — Modern Menswear",
    description: "A study in contemporary form, texture and individuality.",
    type: "website",
    url: "/"
  },
  robots: { index: true, follow: true }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader />{children}<SiteFooter /></body></html>;
}