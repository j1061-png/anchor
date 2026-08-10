"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Section, Eyebrow, Headline, Lead } from "../ui";
import { usePrefersReducedMotion } from "../hooks";

const TARGET = "7";
const DISTRACTIONS = [
  "New notification",
  "Answer ready in ChatGPT",
  "Friend replied",
  "Due in 1 hour",
  "Trending now",
  "Streak at risk",
];

export function AttentionTestSection() {
  const reduced = usePrefersReducedMotion();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [target, setTarget] = useState("—");
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [flash, setFlash] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);
  const round = useRef(0);
  const timer = useRef<number[]>([]);

  const clearTimers = () => {
    timer.current.forEach((id) => window.clearTimeout(id));
    timer.current = [];
  };

  const finish = useCallback(() => {
    clearTimers();
    setRunning(false);
    setDone(true);
    setTarget("—");
    setNotif(null);
  }, []);

  const start = () => {
    clearTimers();
    setDone(false);
    setRunning(true);
    setHits(0);
    setMisses(0);
    setInterruptions(0);
    round.current = 0;
    setTarget(TARGET);
  };

  useEffect(() => {
    if (!running || reduced) return;

    const scheduleDistraction = (delay: number) => {
      const id = window.setTimeout(() => {
        setInterruptions((n) => n + 1);
        setNotif(DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)]!);
        setFlash(true);
        window.setTimeout(() => setFlash(false), 200);
        window.setTimeout(() => setNotif(null), 1800);
      }, delay);
      timer.current.push(id);
    };

    for (let i = 0; i < 8; i++) scheduleDistraction(800 + i * 1100);

    const endId = window.setTimeout(finish, 10000);
    timer.current.push(endId);

    return clearTimers;
  }, [running, reduced, finish]);

  const tap = () => {
    if (!running) return;
    round.current += 1;
    if (target === TARGET) {
      setHits((h) => h + 1);
      setTarget(String(Math.floor(Math.random() * 9)));
      window.setTimeout(() => setTarget(TARGET), reduced ? 0 : 400);
    } else {
      setMisses((m) => m + 1);
    }
  };

  return (
    <Section id="experiment" dark>
      <Eyebrow>Interactive</Eyebrow>
      <Headline>Test your attention</Headline>
      <Lead>
        Tap when the large digit is <span className="mkt-num">7</span>. Distractions
        will appear. This is an experience — not a clinical test. Your score is
        not a diagnosis.
      </Lead>

      <div className="mkt-test-stage">
        {!running && !done && (
          <button type="button" className="mkt-btn mkt-btn--focus" onClick={start}>
            Begin 10-second run
          </button>
        )}

        {running && (
          <>
            <button
              type="button"
              className={`mkt-test-target mkt-num ${flash ? "mkt-test-target--distract" : ""}`}
              onClick={tap}
              aria-label={`Current digit ${target}. Tap when it is 7.`}
            >
              {target}
            </button>
            <div className="mkt-test-notif-layer" aria-live="polite">
              {notif ? <p>{notif}</p> : null}
            </div>
            <p className="mkt-body" style={{ marginTop: "0.75rem", fontSize: "0.75rem" }}>
              Hits: <span className="mkt-num">{hits}</span> · Wrong taps:{" "}
              <span className="mkt-num">{misses}</span>
            </p>
          </>
        )}

        {done && (
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.5rem",
              }}
            >
              Your attention was interrupted{" "}
              <span className="mkt-num">{interruptions}</span> times.
            </p>
            <p className="mkt-body" style={{ marginTop: "0.75rem", maxWidth: "28rem", marginInline: "auto" }}>
              You scored <span className="mkt-num">{hits}</span> correct taps on{" "}
              <span className="mkt-num">7</span> while competing signals pulled at
              working memory. That is what constant availability feels like — not
              a measure of your intelligence.
            </p>
            <button
              type="button"
              className="mkt-btn mkt-btn--ghost"
              style={{ marginTop: "1.25rem" }}
              onClick={start}
            >
              Run again
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
