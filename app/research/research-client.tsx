"use client";

import { DeckStage } from "@/components/marketing/deck-stage";
import { MarketingSiteNav } from "@/components/marketing/site-nav";

export function ResearchPageClient() {
  return (
    <div className="mkt-root mkt-root--immersive mkt-root--research-only">
      <MarketingSiteNav />
      <DeckStage fullscreen />
    </div>
  );
}
