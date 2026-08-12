import Link from "next/link";
import type { Metadata } from "next";
import { MarketingSiteNav } from "@/components/marketing/site-nav";
import { MarketingLogo } from "@/components/marketing/logo";
import { Section, Eyebrow, Headline, Lead } from "@/components/marketing/ui";
import "../marketing.css";

export const metadata: Metadata = {
  title: "About · Anchor",
  description:
    "Anchor is research-backed training that keeps thinking human. Attempt first. Hints after. Brain-only work on a schedule.",
};

export default function AboutPage() {
  return (
    <div className="mkt-root">
      <MarketingSiteNav />

      <header className="mkt-about-hero">
        <div className="mkt-section__inner" style={{ paddingTop: "5.5rem" }}>
          <div className="mkt-logo-panel">
            <MarketingLogo size="lg" />
          </div>
          <Eyebrow>About Anchor</Eyebrow>
          <Headline as="h1" className="mkt-headline--wide">
            Training that keeps the thinking human
          </Headline>
          <Lead>
            Anchor is not another screen-time tracker or productivity dashboard.
            It is daily cognitive training built from the cognitive-offloading
            research — designed for students who need to think for themselves
            when the tools are gone.
          </Lead>
        </div>
      </header>

      <Section className="mkt-section--paper">
        <Eyebrow>The problem</Eyebrow>
        <Headline>Offloading is not new. Generative AI changed the scale.</Headline>
        <p className="mkt-body" style={{ marginTop: "1rem", maxWidth: "40rem", color: "#4a5568" }}>
          Lists, calculators, and search all move work outside your head. Generative
          AI is the first tool that can offload framing, reasoning, judgement, and
          production in one step. The research review behind Anchor asks what that
          does to unaided performance when the tool is removed — especially for
          adolescents still building the skills.
        </p>
        <Link href="/research" className="mkt-btn mkt-btn--focus" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
          Read the full research deck
        </Link>
      </Section>

      <Section dark>
        <Eyebrow>Philosophy</Eyebrow>
        <blockquote className="mkt-about-quote">
          &ldquo;Use AI when it helps you think. Don&apos;t use AI instead of
          thinking.&rdquo; Scaffold, don&apos;t substitute.
        </blockquote>
        <p className="mkt-lead" style={{ marginTop: "1.25rem" }}>
          Technology should be available when you choose it — not because it
          chooses you. Anchor changes the payoff for unaided work: attempt first,
          hints that withhold the answer, scheduled brain-only sessions, and support
          that fades as competence grows.
        </p>
      </Section>

      <Section className="mkt-section--paper">
        <Eyebrow>What the app does</Eyebrow>
        <Headline className="mkt-headline--wide">Built from the intervention record</Headline>
        <ol className="mkt-about-list">
          <li>
            <strong>Attempt-first engine.</strong> No hint until you submit an
            initial answer. Productive failure before instruction.
          </li>
          <li>
            <strong>Guardrailed tutor.</strong> One step at a time, grounded in
            verified solutions. The answer is not on demand.
          </li>
          <li>
            <strong>Brain-only mode.</strong> Scheduled sessions with no AI by
            design — the assisted–unaided gap is measured, not assumed.
          </li>
          <li>
            <strong>Independence profile.</strong> Hint reliance, attempts before
            help, and unaided accuracy — behavioural proxies, not a vanity score.
          </li>
        </ol>
        <div className="mkt-hero__actions" style={{ marginTop: "2rem" }}>
          <Link href="/auth?mode=signup" className="mkt-btn mkt-btn--focus">
            Start training
          </Link>
          <Link href="/research" className="mkt-btn mkt-btn--ghost" style={{ color: "var(--mkt-navy)", borderColor: "var(--mkt-line-dark)" }}>
            Open research deck
          </Link>
        </div>
      </Section>

      <Section dark>
        <Eyebrow>Research</Eyebrow>
        <Headline>Where the evidence lives</Headline>
        <p className="mkt-lead">
          The interactive deck covers adoption, the Bastani RCT, deskilling in
          medicine, design countermeasures, and every caveat the authors volunteered
          before the audience could. Malek Zahran and Abdallah El Dessouky, 2011–2026.
        </p>
        <Link href="/research" className="mkt-btn mkt-btn--ghost" style={{ marginTop: "1.25rem" }}>
          Launch research experience →
        </Link>
      </Section>

      <footer className="mkt-about-footer">
        <p className="mkt-body" style={{ fontSize: "0.75rem" }}>
          <Link href="/" style={{ color: "var(--mkt-muted)", marginRight: "1rem" }}>
            Home
          </Link>
          <Link href="/privacy" style={{ color: "var(--mkt-muted)", marginRight: "1rem" }}>
            Privacy
          </Link>
          <Link href="/terms" style={{ color: "var(--mkt-muted)", marginRight: "1rem" }}>
            Terms
          </Link>
          <Link href="/support" style={{ color: "var(--mkt-muted)" }}>
            Support
          </Link>
        </p>
      </footer>
    </div>
  );
}
