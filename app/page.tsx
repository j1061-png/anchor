import type { Metadata } from "next";
import { MarketingExperience } from "@/components/marketing/experience";
import "./marketing.css";

export const metadata: Metadata = {
  title: "Anchor · Lock distractions. Anchor your focus.",
  description:
    "An interactive exploration of attention, cognitive offloading, and why Anchor exists.",
};

export default function LandingPage() {
  return <MarketingExperience />;
}
