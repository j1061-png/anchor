import type { Metadata, Viewport } from "next";
import { MarketingSiteNav } from "@/components/marketing/site-nav";
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
  return (
    <div className="mkt-root mkt-root--deck mkt-deck-shell">
      <MarketingSiteNav />
      <iframe
        title="Cognitive Offloading research deck"
        src="/research/Cognitive_Offloading_Deck.html"
        className="mkt-deck-frame mkt-deck-frame--full"
      />
    </div>
  );
}
