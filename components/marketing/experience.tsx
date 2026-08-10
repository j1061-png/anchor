"use client";

import { HeroSection } from "./sections/hero";
import { AttentionProblemSection } from "./sections/attention-problem";
import { ResearchThemesSection } from "./sections/research-themes";
import { AttentionTestSection } from "./sections/attention-test";
import { PhoneEnvironmentSection } from "./sections/phone-environment";
import { AnchorRevealSection } from "./sections/anchor-reveal";
import { ProductWalkthroughSection } from "./sections/product-walkthrough";
import { ManifestoSection } from "./sections/manifesto";
import { SourcesSection } from "./sections/sources";
import { FooterCta } from "./sections/footer-cta";

export function MarketingExperience() {
  return (
    <div className="mkt-root">
      <HeroSection />
      <AttentionProblemSection />
      <ResearchThemesSection />
      <AttentionTestSection />
      <PhoneEnvironmentSection />
      <AnchorRevealSection />
      <ProductWalkthroughSection />
      <ManifestoSection />
      <SourcesSection />
      <FooterCta />
    </div>
  );
}
