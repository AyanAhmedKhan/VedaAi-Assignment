import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/CommandPalette";
import { ShortcutsOverlay } from "@/components/ShortcutsOverlay";
import { ProductTour } from "@/components/ProductTour";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VedaAI — AI Assessment Creator",
    template: "%s · VedaAI",
  },
  description:
    "Generate exam-ready question papers in seconds with AI. Sections, difficulty, marks, downloadable PDF — built for teachers.",
  applicationName: "VedaAI",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "VedaAI — AI Assessment Creator",
    description: "Generate exam-ready question papers in seconds.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF5623",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <CommandPalette />
        <ShortcutsOverlay />
        <ProductTour />
      </body>
    </html>
  );
}
