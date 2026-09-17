import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Poppins, Public_Sans } from "next/font/google";
import "./globals.css";

const body = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  title: "clep — Turn any feature into a 3–5 second product clip",
  description:
    "Add one data-clep attribute to your React app, run /clep:clep in Claude Code, and get a cinematic 1080p60 product clip. No screen recording. No timeline editing.",
  metadataBase: new URL("https://clep.vercel.app"),
  openGraph: {
    title: "clep — Code it. Clip it. Ship it.",
    description:
      "Your code already knows how your product works. Turn any feature into a 3–5 second product clip.",
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
