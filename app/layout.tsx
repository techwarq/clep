import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Poppins, Public_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const body = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-public"
});
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-inst"
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex"
});
// Self-hosted: next/font/google's Inter Tight fetch breaks Vercel builds.
const tight = localFont({ src: "./fonts/InterTight-latin-wght-normal.woff2", weight: "100 900", variable: "--font-tight" });
const logo = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-logo" });

export const metadata: Metadata = {
  title: "clep — Launch your product every day",
  description:
    "The fastest, cheapest way to make launch videos. Paste your site, describe the video, get studio-grade motion in your brand.",
  // Absolute base for og:image — the deployed domain, never hardcoded.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
  ),
  openGraph: {
    title: "clep — Launch your product every day",
    description:
      "Paste your site. Describe the video. Get a studio-grade launch video in minutes.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "clep — Launch your product every day",
    description: "Paste your site. Describe the video. Get a studio-grade launch video in minutes."
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable} ${logo.variable} ${tight.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
