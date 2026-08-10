"use client";

import { ResearchHeroSection } from "./sections/research-hero";
import { AdoptionStatsSection } from "./sections/adoption-stats";
import { BastaniRctSection } from "./sections/bastani-rct";
import { DeskillingSection } from "./sections/deskilling-chart";
import { ResearchThemesSection } from "./sections/research-themes";
import { DeckEmbedSection } from "./sections/deck-embed";
import { SourcesSection } from "./sections/sources";
import { ProductWalkthroughSection } from "./sections/product-walkthrough";
import { FooterCta } from "./sections/footer-cta";
import { MarketingSiteNav } from "./site-nav";

/** Research-led interactive experience: AI cognitive offloading first, product second. */
export function MarketingExperience() {
  return (
    <div className="mkt-root mkt-root--deck">
      <MarketingSiteNav />
      <ResearchHeroSection />
      <AdoptionStatsSection />
      <BastaniRctSection />
      <DeskillingSection />
      <ResearchThemesSection />
      <DeckEmbedSection />
      <SourcesSection />
      <ProductWalkthroughSection />
      <FooterCta />
    </div>
  );
}
