import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/components/BrandProvider";

// Cove Loyalty Platform - Production Release FINAL

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#3F1215",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Cove Coffee House — Loyalty & Rewards",
  description: "Private digital loyalty pass and rewards for Cove Coffee House",
  applicationName: "Cove",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cove",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/favicon.png?v=2", type: "image/png", sizes: "64x64" },
      { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/favicon.ico?v=2"],
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
    ],
  },
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
    <html lang="en" dir="ltr" className={ibmPlexArabic.variable}>
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />

        {/* Browser tab favicons and PWA icons with cache busting */}
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=2" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=2" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#3F1215" />
        {/* manifest and apple-mobile-web-app-title are set per-route via child layouts */}
      </head>
      <body className={`${ibmPlexArabic.className} min-h-screen bg-[#FAF5F2] text-[#2B0B0D] antialiased selection:bg-[#3F1215] selection:text-[#FEECE2]`}>
        <BrandProvider>{children}</BrandProvider>
      </body>
    </html>
  );
}
