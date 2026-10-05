import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ClickFx from "@/components/ClickFx";
import Motion from "@/components/fx/Motion";
import Pointer from "@/components/fx/Pointer";
import Intro from "@/components/fx/Intro";
import { site } from "@/lib/site";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin", "vietnamese"] }); // variable font: all weights in one file

export const metadata: Metadata = {
  // Absolute base so the link-preview image (app/opengraph-image.png) resolves to a full URL.
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.mission,
  openGraph: { title: `${site.name} — ${site.tagline}`, description: site.mission, type: "website", siteName: site.name, url: "/", locale: "en_US" },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.tagline}`, description: site.mission },
};

/* Runs before first paint:
   - applies a saved theme choice, so there is no flash
   - turns on scroll-reveal start states (html.motion) unless the visitor prefers reduced motion;
     if the motion engine has not started 4 s later, they are switched off again so nothing stays hidden
   - plays the opening curtain once per session (html.no-intro hides it) */
const headScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}
(function(){var d=document.documentElement;try{var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!rm){d.classList.add("motion");setTimeout(function(){if(!window.__fxReady)d.classList.remove("motion")},4000)}
if(rm||sessionStorage.getItem("intro"))d.classList.add("no-intro");else sessionStorage.setItem("intro","1")}catch(e){d.classList.add("no-intro")}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <Intro />
        <Nav />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <ClickFx />
        <Motion />
        <Pointer />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
