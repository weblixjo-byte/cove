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
  return <>{children}</>;
}
