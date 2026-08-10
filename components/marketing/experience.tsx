"use client";

import { HeroSection } from "./sections/hero";
import { AttentionProblemSection } from "./sections/attention-problem";
import { AttentionTestSection } from "./sections/attention-test";
import { PhoneEnvironmentSection } from "./sections/phone-environment";
import { AnchorRevealSection } from "./sections/anchor-reveal";
import { ProductWalkthroughSection } from "./sections/product-walkthrough";
import { ManifestoSection } from "./sections/manifesto";
import { ResearchTeaserSection } from "./sections/research-teaser";
import { FooterCta } from "./sections/footer-cta";

export function MarketingExperience() {
  return (
    <div className="mkt-root">
      <HeroSection />
      <AttentionProblemSection />
      <AttentionTestSection />
      <PhoneEnvironmentSection />
      <AnchorRevealSection />
      <ProductWalkthroughSection />
      <ManifestoSection />
      <ResearchTeaserSection />
      <FooterCta />
    </div>
  );
}
