import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/site";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Radman Labs — Engineering Ideas Into Reality.",
    template: "%s | Radman Labs",
  },
  description:
    "Independent software and AI product studio founded by Rohullah Radman. Discover thoughtfully engineered applications.",
  openGraph: {
    type: "website",
    siteName: "Radman Labs",
    title: "Radman Labs",
    description: "Engineering Ideas Into Reality.",
  },
  twitter: { card: "summary_large_image" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
