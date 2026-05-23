import type { Metadata } from "next";
import { VadiAppMarketingClient } from "./VadiAppMarketingClient";

export const metadata: Metadata = {
  title: "VADI App — Marketing",
  description:
    "Marketing and design preview for the VADI consumer app. No commerce or account actions.",
  robots: { index: false, follow: false },
};

export default function VadiAppMarketingPage() {
  return <VadiAppMarketingClient />;
}
