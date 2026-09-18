import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cove Cashier POS Terminal",
  description: "Point of Sale & Loyalty Scanner for Cove Staff",
  applicationName: "Cove Cashier",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cove Cashier",
  },
  manifest: "/manifest-cashier.json",
};

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <link rel="manifest" href="/manifest-cashier.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cove Cashier" />
        <meta name="application-name" content="Cove Cashier POS" />
      </head>
      {children}
    </>
  );
}
