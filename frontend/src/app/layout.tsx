import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ClickFx from "@/components/ClickFx";
import { site } from "@/lib/site";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin", "vietnamese"] }); // variable font: all weights in one file

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.mission,
  openGraph: { title: `${site.name} — ${site.tagline}`, description: site.mission, type: "website" },
};

/* Applies a saved theme choice before first paint so there is no flash. */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <ClickFx />
      </body>
    </html>
  );
}
