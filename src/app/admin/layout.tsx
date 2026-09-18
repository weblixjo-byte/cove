import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cove Admin Dashboard",
  description: "Cove Coffee House Executive Admin Dashboard",
  applicationName: "Cove Admin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cove Admin",
  },
  manifest: "/manifest-admin.json",
  other: {
    "application-name": "Cove Admin Dashboard",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
