import type { Metadata } from "next";
import "./globals.css";
import { BrandProvider } from "@/components/BrandProvider";

export const metadata: Metadata = {
  title: "Cove Coffee House — Loyalty & Rewards",
  description: "Private white-label loyalty pass for Cove Coffee House",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
      </head>
      <body className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased selection:bg-[#2C221E] selection:text-white">
        <BrandProvider>{children}</BrandProvider>
      </body>
    </html>
  );
}
