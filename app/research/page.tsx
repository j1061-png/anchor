import type { Metadata, Viewport } from "next";
import { ResearchPageClient } from "./research-client";
import "../marketing.css";

export const metadata: Metadata = {
  title: "Research · Cognitive offloading & AI",
  description:
    "Interactive research on generative AI, cognitive offloading, and why unaided skill still matters.",
};

export const viewport: Viewport = {
  themeColor: "#0B0A24",
};

export default function ResearchPage() {
  return <ResearchPageClient />;
}
