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
  return <>{children}</>;
}
