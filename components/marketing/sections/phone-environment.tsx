"use client";

import { useState } from "react";
import { Section, Eyebrow, Headline, Lead, PhoneFrame } from "../ui";

const APPS = [
  {
    id: "messages",
    icon: "Msg",
    name: "Messages",
    role: "Social obligation — every thread demands an immediate reply slot in working memory.",
  },
  {
    id: "social",
    icon: "Feed",
    name: "Social",
    role: "Infinite novelty. Reward before control — the adolescent brain takes the shortcut.",
  },
  {
    id: "ai",
    icon: "AI",
    name: "AI tutor",
    role: "Can offload framing, reasoning, judgement, and production in one step — the whole chain.",
  },
  {
    id: "search",
    icon: "Go",
    name: "Search",
    role: "The Google effect: remember where to find it, not what it was (Sparrow et al., 2011).",
  },
  {
    id: "calendar",
    icon: "Cal",
    name: "Calendar",
    role: "Future tasks colonise the present — each event a open loop.",
  },
  {
    id: "school",
    icon: "Sch",
    name: "School",
    role: "85% of AI-using students apply it to schoolwork (Common Sense Media, 2026).",
  },
  {
    id: "news",
    icon: "News",
    name: "News",
    role: "Reactive urgency. Something else to react to, always.",
  },
  {
    id: "games",
    icon: "Play",
    name: "Play",
    role: "Variable reward competes with the slow effort that actually builds skill.",
  },
] as const;

export function PhoneEnvironmentSection() {
  const [active, setActive] = useState<string>("ai");

  const app = APPS.find((a) => a.id === active)!;

  return (
    <Section id="environment" dark>
      <Eyebrow>The phone as environment</Eyebrow>
      <Headline className="mkt-headline--wide">
        The problem is not one app. It is constant availability.
      </Headline>
      <Lead>
        Swipe through the home screen. Each tile is a different cognitive demand
        on the same working memory.
      </Lead>

      <PhoneFrame label="Phone home screen" className="mkt-phone--calm">
        <div className="mkt-phone__status">
          <span>Home</span>
          <span>Wi‑Fi</span>
        </div>
        <div className="mkt-phone__content" style={{ padding: "0.65rem 0.35rem" }}>
          <div className="mkt-phone-scroll" role="tablist" aria-label="App tiles">
            {APPS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={active === a.id}
                className={`mkt-app-tile ${active === a.id ? "mkt-app-tile--active" : ""}`}
                onClick={() => setActive(a.id)}
              >
                <div className="mkt-app-tile__icon">{a.icon}</div>
                <div className="mkt-app-tile__name">{a.name}</div>
              </button>
            ))}
          </div>
          <div
            style={{
              margin: "1rem 0.65rem 0",
              padding: "0.85rem",
              border: "1px solid var(--mkt-line)",
              borderRadius: "0.65rem",
              background: "rgb(255 255 255 / 0.03)",
              minHeight: "5rem",
            }}
            role="tabpanel"
          >
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--mkt-blue)" }}>
              {app.name}
            </p>
            <p className="mkt-body" style={{ marginTop: "0.45rem", fontSize: "0.8125rem" }}>
              {app.role}
            </p>
          </div>
        </div>
      </PhoneFrame>
    </Section>
  );
}
