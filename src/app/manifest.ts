import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cove Coffee House",
    short_name: "Cove",
    description: "Cove Coffee House Loyalty Pass & Rewards",
    start_url: "/customer",
    display: "standalone",
    background_color: "#3F1215",
    theme_color: "#3F1215",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Cashier POS Terminal",
        short_name: "Cashier POS",
        description: "Open Cashier POS Checkout Terminal",
        url: "/cashier",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Customer Digital Pass",
        short_name: "Customer Pass",
        description: "Open Member Loyalty Pass",
        url: "/customer",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
