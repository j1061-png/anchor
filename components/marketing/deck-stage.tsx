"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const DECK_SRC = "/research/Cognitive_Offloading_Deck.html?embed=1";

export const DECK_CHAPTERS = [
  { title: "Introduction", short: "Intro" },
  { title: "Already offloading", short: "Offload" },
  { title: "AI everywhere", short: "Adoption" },
  { title: "Not a calculator", short: "Tools" },
  { title: "Bastani RCT", short: "RCT" },
  { title: "Doctor deskilling", short: "Doctors" },
  { title: "Adolescents", short: "Teens" },
  { title: "Design fixes it", short: "Design" },
  { title: "Conclusion", short: "End" },
] as const;

type DeckMessage = {
  type: "anchor-deck-slide";
  slide: number;
  total: number;
  accent: string;
  title: string;
};

type DeckStageProps = {
  fullscreen?: boolean;
  className?: string;
};

export function DeckStage({ fullscreen = false, className = "" }: DeckStageProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [accent, setAccent] = useState("purple");
  const [title, setTitle] = useState<string>(DECK_CHAPTERS[0].title);
  const [ready, setReady] = useState(false);
  const [fs, setFs] = useState(false);

  const postGo = useCallback((index: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "anchor-deck-go", slide: index },
      "*",
    );
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as DeckMessage;
      if (!data || data.type !== "anchor-deck-slide") return;
      setSlide(data.slide);
      setAccent(data.accent || "purple");
      setTitle(data.title || DECK_CHAPTERS[data.slide]?.title || "");
      setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const onIframeLoad = useCallback(() => {
    // Deck may finish init before the parent listener attaches — nudge + fallback.
    window.setTimeout(() => {
      postGo(slide);
      setReady(true);
    }, 400);
  }, [postGo, slide]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        postGo(Math.min(slide + 1, DECK_CHAPTERS.length - 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        postGo(Math.max(slide - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [postGo, slide]);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const onMove = (e: MouseEvent) => {
      const r = node.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      node.style.setProperty("--tilt-x", `${y * -4}deg`);
      node.style.setProperty("--tilt-y", `${x * 5}deg`);
      node.style.setProperty("--mx", `${e.clientX - r.left}px`);
      node.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    node.addEventListener("mousemove", onMove);
    return () => node.removeEventListener("mousemove", onMove);
  }, []);

  const toggleFs = async () => {
    const el = frameRef.current?.closest(".mkt-stage") ?? frameRef.current;
    if (!document.fullscreenElement) {
      await el?.requestFullscreen();
      setFs(true);
    } else {
      await document.exitFullscreen();
      setFs(false);
    }
  };

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const progress = ((slide + 1) / DECK_CHAPTERS.length) * 100;

  return (
    <section
      className={`mkt-stage mkt-stage--accent-${accent} ${fullscreen ? "mkt-stage--fullscreen" : ""} ${className}`}
      id="deck"
    >
      <div className="mkt-stage__ambient" aria-hidden />
      <div className="mkt-stage__mesh" aria-hidden />

      <div className="mkt-stage__header">
        <div>
          <p className="mkt-eyebrow mkt-eyebrow--glow">Interactive research</p>
          <h2 className="mkt-stage__title">{title}</h2>
        </div>
        <div className="mkt-stage__meta">
          <span className="mkt-stage__counter">
            <span className="mkt-num">{slide + 1}</span> / {DECK_CHAPTERS.length}
          </span>
          <button type="button" className="mkt-stage__fs" onClick={toggleFs}>
            {fs ? "Exit fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      <div className="mkt-stage__progress" aria-hidden>
        <div className="mkt-stage__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="mkt-stage__chapters" role="tablist" aria-label="Deck chapters">
        {DECK_CHAPTERS.map((ch, i) => (
          <button
            key={ch.title}
            type="button"
            role="tab"
            aria-selected={slide === i}
            aria-label={`${i + 1}. ${ch.title}`}
            title={ch.title}
            className={`mkt-stage__chapter ${slide === i ? "mkt-stage__chapter--on" : ""}`}
            onClick={() => postGo(i)}
          >
            <span className="mkt-stage__chapter-num">{i + 1}</span>
            <span className="mkt-stage__chapter-label">{ch.short}</span>
          </button>
        ))}
      </div>

      <div className="mkt-stage__frame-wrap">
        <button
          type="button"
          className="mkt-stage__nav mkt-stage__nav--prev"
          aria-label="Previous slide"
          onClick={() => postGo(Math.max(0, slide - 1))}
          disabled={slide === 0}
        >
          ←
        </button>

        <div ref={frameRef} className={`mkt-stage__frame ${ready ? "mkt-stage__frame--ready" : ""}`}>
          <div className="mkt-stage__frame-glow" aria-hidden />
          <iframe
            ref={iframeRef}
            title="Cognitive Offloading research deck"
            src={DECK_SRC}
            className="mkt-stage__iframe"
            allowFullScreen
            onLoad={onIframeLoad}
          />
          {!ready ? (
            <div className="mkt-stage__loader">
              <span className="mkt-stage__loader-ring" />
              <p>Loading research deck…</p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="mkt-stage__nav mkt-stage__nav--next"
          aria-label="Next slide"
          onClick={() => postGo(Math.min(DECK_CHAPTERS.length - 1, slide + 1))}
          disabled={slide === DECK_CHAPTERS.length - 1}
        >
          →
        </button>
      </div>

      <div className="mkt-stage__dock">
        <p className="mkt-stage__hint">
          ← → navigate · tap chapters · swipe inside deck · charts are interactive
        </p>
        <div className="mkt-stage__dock-actions">
          <Link href="/about" className="mkt-btn mkt-btn--ghost">
            About Anchor
          </Link>
          <Link href="/auth?mode=signup" className="mkt-btn mkt-btn--focus">
            Start training
          </Link>
        </div>
      </div>
    </section>
  );
}
