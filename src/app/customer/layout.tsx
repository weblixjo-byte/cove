import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cove Digital Loyalty Pass",
  description: "Cove Coffee House Digital Loyalty Pass & Rewards",
  applicationName: "Cove Pass",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cove Pass",
  },
  manifest: "/manifest.json",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cove Pass" />
        <meta name="application-name" content="Cove Pass" />
      </head>
      {children}
    </>
  );
}
