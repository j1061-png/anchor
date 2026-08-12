"use client";

import { useEffect, useState } from "react";
import { ShareButton } from "@/components/share/share-button";

interface TimelineEvent {
  id: string;
  kind: "session" | "learn" | "achievement" | "milestone" | "streak";
  title: string;
  description: string;
  xpDelta: number;
  totalXp: number;
  level: number;
  timestamp: string;
  principle?: string;
  meta?: Record<string, string | number | boolean>;
}

interface TimelineSummary {
  totalXp: number;
  level: number;
  streakCurrent: number;
  streakLongest: number;
  nextMilestone: { xp: number; title: string; xpRemaining: number } | null;
  memberSince: string;
}

const KIND_LABELS: Record<TimelineEvent["kind"], string> = {
  session: "Training",
  learn: "Learn",
  achievement: "Achievement",
  milestone: "Milestone",
  streak: "Streak",
};

const KIND_COLORS: Record<TimelineEvent["kind"], string> = {
  session: "var(--accent)",
  learn: "var(--success)",
  achievement: "var(--gold)",
  milestone: "var(--flag)",
  streak: "var(--block-4)",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(iso);
}

export function XpTimeline({ className = "" }: { className?: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [summary, setSummary] = useState<TimelineSummary | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress/timeline")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setEvents(d.events ?? []);
        setSummary(d.summary ?? null);
        if (d.events?.length) setActiveId(d.events[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = events.find((e) => e.id === activeId) ?? events[0] ?? null;

  const progressPct = summary?.nextMilestone
    ? Math.min(
        100,
        ((summary.totalXp - (summary.nextMilestone.xp - summary.nextMilestone.xpRemaining)) /
          summary.nextMilestone.xp) *
          100,
      )
    : 100;

  if (loading) {
    return (
      <section className={`plane p-6 ${className}`} aria-label="Loading progress timeline">
        <div className="h-32 animate-pulse rounded-(--radius-ctl) bg-mist/60" />
      </section>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <section className={`plane overflow-hidden ${className}`} aria-label="Your progress timeline">
      {/* Hero summary */}
      <div className="border-b border-ink/8 bg-gradient-to-br from-accent-soft/40 to-transparent p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="principle-tag">Process over product</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Level <span className="num">{summary.level}</span>
            </h2>
            <p className="mt-1 text-slate">
              <span className="num font-semibold text-ink">{summary.totalXp}</span> XP from
              independent thinking — not from showing up
            </p>
          </div>
          <div className="text-right">
            <p className="num font-display text-2xl font-extrabold">{summary.streakCurrent}</p>
            <p className="text-xs text-slate">recall days</p>
          </div>
        </div>

        {summary.nextMilestone && (
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold">{summary.nextMilestone.title}</span>
              <span className="num text-slate">
                {summary.nextMilestone.xpRemaining} XP to go
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Interactive timeline */}
      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div className="max-h-[420px] overflow-y-auto p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate">
            Your journey
          </p>
          <div className="xp-timeline-track">
            {events.length === 0 ? (
              <p className="text-sm text-slate">
                Complete your first session to start building your timeline.
              </p>
            ) : (
              events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  data-milestone={event.kind === "milestone"}
                  data-active={activeId === event.id}
                  className="xp-timeline-node w-full cursor-pointer rounded-(--radius-ctl) px-4 py-2 text-left transition-colors hover:bg-mist/40"
                  onClick={() => setActiveId(event.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className="inline-block rounded-(--radius-pill) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          background: `color-mix(in srgb, ${KIND_COLORS[event.kind]} 15%, white)`,
                          color: KIND_COLORS[event.kind],
                        }}
                      >
                        {KIND_LABELS[event.kind]}
                      </span>
                      <p className="mt-1 text-sm font-semibold">{event.title}</p>
                      <p className="text-xs text-slate">{formatRelative(event.timestamp)}</p>
                    </div>
                    {event.xpDelta > 0 && (
                      <span className="num shrink-0 text-sm font-semibold text-success">
                        +{event.xpDelta}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="border-t border-ink/8 bg-mist/30 p-6 lg:border-t-0 lg:border-l">
          {active ? (
            <div className="deal-in">
              <p className="text-xs text-slate">{formatDate(active.timestamp)}</p>
              <h3 className="mt-1 font-display text-xl font-extrabold">{active.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{active.description}</p>
              {active.principle && (
                <div className="mt-4 rounded-(--radius-ctl) bg-accent-soft/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Research principle
                  </p>
                  <p className="mt-1 text-sm font-medium">{active.principle}</p>
                  <p className="mt-1 text-xs text-slate">
                    Anchor rewards the thinking you keep in your head, not shortcuts.
                  </p>
                </div>
              )}
              {active.xpDelta > 0 && (
                <p className="num mt-4 text-sm text-slate">
                  +{active.xpDelta} XP · Level {active.level} · {active.totalXp} total
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate">Select an event to see details.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export interface ProgressShareProps {
  userId: string;
  friendCode?: string;
  streak?: number;
  level?: number;
  xp?: number;
  className?: string;
}

export function ProgressShare({
  userId,
  friendCode,
  streak = 0,
  level = 0,
  xp = 0,
  className = "",
}: ProgressShareProps) {
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const shareText = `Level ${level} on Anchor — ${xp} XP from actually thinking, ${streak} recall days. The app that makes you work before it helps.`;

  return (
    <section className={`plane p-6 ${className}`} aria-label="Share your progress">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="principle-tag">Share the process</span>
          <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight">
            Show what you&apos;re building
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate">
            Share your independence streak and level — not a generic score, but proof
            you&apos;re keeping the thinking in your head.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 rounded-(--radius-ctl) bg-mist/60 px-4 py-3">
          <div className="text-center">
            <p className="num font-display text-2xl font-extrabold">{level}</p>
            <p className="text-[10px] font-semibold uppercase text-slate">Level</p>
          </div>
          <div className="h-8 w-px bg-ink/10" />
          <div className="text-center">
            <p className="num font-display text-2xl font-extrabold">{streak}</p>
            <p className="text-[10px] font-semibold uppercase text-slate">Recall days</p>
          </div>
          <div className="h-8 w-px bg-ink/10" />
          <div className="text-center">
            <p className="num font-display text-2xl font-extrabold">{xp}</p>
            <p className="text-[10px] font-semibold uppercase text-slate">XP</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <ShareButton
          title="My Anchor progress"
          text={shareText}
          url={`${siteUrl}/auth?mode=signup`}
          imageUrl={`/api/share/streak/${userId}`}
          friendCode={friendCode}
        />
      </div>
    </section>
  );
}
