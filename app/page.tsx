import type { Metadata } from "next";
import { MarketingExperience } from "@/components/marketing/experience";
import "./marketing.css";

export const metadata: Metadata = {
  title: "Cognitive Offloading · Your brain on autopilot",
  description:
    "Interactive research on generative AI and cognitive offloading — adoption data, Bastani RCT, deskilling evidence, and the full deck.",
};

export default function LandingPage() {
  return <MarketingExperience />;
}
