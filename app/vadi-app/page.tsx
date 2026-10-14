import type { Metadata } from "next";
import { VadiAppMarketingClient } from "./VadiAppMarketingClient";

export const metadata: Metadata = {
  title: "VADI Fresh — Farm-fresh groceries delivered in hours",
  description:
    "Download the VADI Fresh app to order hand-picked vegetables, fruits, dairy and pantry staples straight from 200+ local Gujarat farms — harvested within 24 hours and delivered to your door.",
  icons: { icon: "/vadi-logo.png", apple: "/vadi-logo.png" },
  openGraph: {
    title: "VADI Fresh — Farm-fresh groceries delivered in hours",
    description:
      "Farm-fresh organic produce delivered to your door, through one beautifully simple app.",
    images: ["/vadi-logo-full.png"],
  },
};

export default function VadiAppMarketingPage() {
  return <VadiAppMarketingClient />;
}
