import type { Metadata } from "next";
import { Doto, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

const doto = Doto({ variable: "--font-doto", subsets: ["latin"], weight: ["400", "700"] });
const grotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin", "vietnamese"], weight: ["300", "400", "500"] });
const mono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin", "vietnamese"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.mission,
  openGraph: { title: `${site.name} — ${site.tagline}`, description: site.mission, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${doto.variable} ${grotesk.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
