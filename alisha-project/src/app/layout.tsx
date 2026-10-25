import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { loadContent } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  const name = content.copy.siteName;
  return {
    title: { default: name, template: `%s · ${name}` },
    description: content.copy.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await loadContent();
  const theme = content.theme;
  const style = {
    "--cream": theme.cream,
    "--ink": theme.ink,
    "--ink-soft": `color-mix(in srgb, ${theme.ink} 68%, ${theme.cream})`,
    "--cream-deep": `color-mix(in srgb, ${theme.cream} 78%, ${theme.ink})`,
    "--lavender": theme.lavender,
    "--lavender-deep": theme.lavenderDeep,
    "--pink": theme.pink,
    "--pink-deep": theme.pinkDeep,
    "--sage": theme.sage,
    "--sage-deep": theme.sageDeep,
    "--blue": theme.blue,
    "--blue-deep": theme.blueDeep,
    "--gold": theme.gold,
    "--radius": `${theme.radius}px`,
  } as CSSProperties;

  return (
    <html lang="en" style={style}>
      <body className={`${display.variable} ${body.variable}`}>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader siteName={content.copy.siteName} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
