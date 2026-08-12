"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarketingSiteNav } from "../site-nav";
import { MarketingLogo } from "../logo";
import { Eyebrow, Headline, Lead, PhoneFrame } from "../ui";
import { usePrefersReducedMotion } from "../hooks";

const NOTIFICATIONS = [
  { title: "New message", body: "Are you free right now?" },
  { title: "Assignment due", body: "Essay draft — use AI to finish?" },
  { title: "Trending", body: "3 friends posted in the last minute" },
  { title: "Reminder", body: "You opened this app 14 times today" },
  { title: "ChatGPT", body: "Here's a complete answer to your question" },
  { title: "Calendar", body: "Meeting in 10 min — did you prepare?" },
  { title: "News alert", body: "Breaking: something else to react to" },
  { title: "Streak", body: "Don't lose your 47-day streak" },
] as const;

export function HeroSection() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"idle" | "noise" | "calm">("idle");
  const [visibleCount, setVisibleCount] = useState(0);
  const [fragment, setFragment] = useState(0);
  const scrollRef = useRef(0);

  const rampNoise = useCallback(() => {
    setPhase("noise");
    let i = 0;
    const tick = () => {
      i += 1;
      setVisibleCount(Math.min(i, NOTIFICATIONS.length));
      setFragment(Math.min(100, Math.round((i / NOTIFICATIONS.length) * 100)));
      if (i < NOTIFICATIONS.length) window.setTimeout(tick, reduced ? 0 : 420);
    };
    tick();
  }, [reduced]);

  useEffect(() => {
    const onScroll = () => {
      if (phase !== "idle") return;
      scrollRef.current += 1;
      if (scrollRef.current > (reduced ? 2 : 8)) rampNoise();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, rampNoise, reduced]);

  const focus = () => {
    setPhase("calm");
    setFragment(12);
  };

  const reset = () => {
    setPhase("idle");
    setVisibleCount(0);
    setFragment(0);
    scrollRef.current = 0;
  };

  return (
    <header className="mkt-hero">
      <div className="mkt-section__inner mkt-hero__grid">
        <div>
          <div className="mkt-logo-panel">
            <MarketingLogo size="md" />
          </div>
          <Eyebrow>Attention &amp; cognitive offloading</Eyebrow>
          <Headline as="h1" className="mkt-headline--wide">
            How much of your attention belongs to you?
          </Headline>
          <Lead>
            Every ping, feed, and instant answer competes for the same working
            memory. Anchor exists because the research says what we offload
            today, we may not be able to do alone tomorrow.
          </Lead>
          <div className="mkt-hero__actions">
            <button type="button" className="mkt-btn mkt-btn--ghost" onClick={rampNoise}>
              Flood the phone
            </button>
            <a href="#attention-problem" className="mkt-btn mkt-btn--ghost">
              See the research
            </a>
            <Link href="/research" className="mkt-btn mkt-btn--ghost">
              Open full deck
            </Link>
          </div>
          <div className="mkt-fragment-bar" aria-hidden>
            {[0, 1, 2, 3].map((n) => (
              <span key={n}>
                <i style={{ width: `${Math.max(0, fragment - n * 25)}%` }} />
              </span>
            ))}
          </div>
          <p className="mkt-body" style={{ marginTop: "0.85rem", fontSize: "0.75rem" }}>
            Scroll, tap flood, or dismiss notifications. Then try to focus.
          </p>
        </div>

        <div>
          <PhoneFrame
            className={phase === "calm" ? "mkt-phone--calm" : ""}
            label="Interactive attention demo"
          >
            <div className="mkt-phone__status">
              <span>9:41</span>
              <span>LTE ▮▮▮</span>
            </div>
            <div className="mkt-phone__content">
              {NOTIFICATIONS.map((n, i) => (
                <div
                  key={n.title}
                  className={`mkt-notif ${i < visibleCount && phase !== "calm" ? "mkt-notif--live" : ""}`}
                  style={{ top: `${12 + i * 11}%`, transitionDelay: `${i * 40}ms` }}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (phase === "noise") setVisibleCount((c) => Math.max(0, c - 1));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (phase === "noise") setVisibleCount((c) => Math.max(0, c - 1));
                    }
                  }}
                >
                  <span className="mkt-notif__dot" aria-hidden />
                  <div>
                    <p className="mkt-notif__title">{n.title}</p>
                    <p className="mkt-notif__body">{n.body}</p>
                  </div>
                </div>
              ))}
              <div className="mkt-phone__focus-ring">
                <span>One task. Nothing else.</span>
              </div>
            </div>
          </PhoneFrame>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            {phase === "calm" ? (
              <button type="button" className="mkt-btn mkt-btn--ghost" onClick={reset}>
                Reset demo
              </button>
            ) : (
              <button type="button" className="mkt-btn mkt-btn--focus" onClick={focus}>
                Try to focus
              </button>
            )}
          </div>
        </div>
      </div>

      <MarketingSiteNav />
    </header>
  );
}
