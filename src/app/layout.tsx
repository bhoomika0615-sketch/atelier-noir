import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgress } from "@/components/scroll-progress";

export const metadata: Metadata = {
  title: "ATELIER NOIR — Modern Menswear",
  description: "A study in contemporary form, texture and individuality.",
  robots: { index: true, follow: true }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ScrollProgress />
        <a href="#main-content" className="skip-link">Skip to content</a>
        <div className="site-shell">
          <SiteHeader />
          <div id="main-content" tabIndex={-1}>{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}