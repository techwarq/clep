import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Poppins, Public_Sans } from "next/font/google";
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
const logo = Poppins({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-logo" });

export const metadata: Metadata = {
  title: "clep — Turn it into video",
  description:
    "Create product videos, walkthroughs, and UI mockups directly from your code. One command: /clep.",
  metadataBase: new URL("https://clep.vercel.app"),
  openGraph: {
    title: "clep — Your product knows how it works. Turn it into video.",
    description:
      "Mark a feature with data-clep, run /clep, get a cinematic product video.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable} ${logo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
