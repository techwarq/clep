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
  title: "clep — Turn messy documents into structured data.",
  description:
    "Upload PDFs, scans, screenshots, receipts, invoices, statements or photos. Tell Clep what you need — it extracts the data, verifies it, and flags only what needs review.",
  metadataBase: new URL("https://clep.vercel.app"),
  openGraph: {
    title: "clep — Give Clep anything messy. Get clean, verified data back.",
    description:
      "No templates. No surprise credits. Live conversion in your browser.",
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
