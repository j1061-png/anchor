import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { levelForXp } from "@/lib/types";

export interface TimelineEvent {
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

const MILESTONES = [
  { xp: 100, title: "First level up", principle: "Desirable difficulty" },
  { xp: 400, title: "Building recall", principle: "Attempt before AI" },
  { xp: 900, title: "Independent streak", principle: "Grade the process" },
  { xp: 1600, title: "Deep practice", principle: "Brain-only work" },
  { xp: 2500, title: "Sustained effort", principle: "Fading help" },
];

interface LearnAttemptRow {
  id: string;
  xp_awarded: number;
  outcome: string | null;
  completed_at: string | null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level, streak_current, streak_longest, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const db = supabase as unknown as SupabaseClient;

  const [sessions, learnResult, achievements] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, type, date, xp_earned, accuracy, completed_at")
      .eq("user_id", user.id)
      .eq("status", "complete")
      .gt("xp_earned", 0)
      .order("completed_at", { ascending: false })
      .limit(40),
    db
      .from("item_attempts")
      .select("id, xp_awarded, outcome, completed_at")
      .eq("user_id", user.id)
      .gt("xp_awarded", 0)
      .order("completed_at", { ascending: false })
      .limit(40),
    supabase
      .from("achievements")
      .select("id, achievement_key, unlocked_at")
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false })
      .limit(20),
  ]);

  const learnAttempts = (learnResult.data ?? []) as LearnAttemptRow[];

  const events: TimelineEvent[] = [];

  for (const s of sessions.data ?? []) {
    if (!s.completed_at || !s.xp_earned) continue;
    const solved = s.accuracy != null ? Math.round(s.accuracy * 5) : null;
    events.push({
      id: `session-${s.id}`,
      kind: "session",
      title:
        s.type === "daily"
          ? "Daily five completed"
          : s.type === "practice"
            ? "Practice session"
            : "Challenge session",
      description:
        solved != null
          ? `${solved}/5 puzzles solved without outsourcing the thinking`
          : "Puzzle session completed",
      xpDelta: s.xp_earned,
      totalXp: 0,
      level: 0,
      timestamp: s.completed_at,
      principle: "Attempt before AI",
      meta: { sessionType: s.type, date: s.date },
    });
  }

  for (const a of learnAttempts) {
    if (!a.completed_at || !a.xp_awarded) continue;
    events.push({
      id: `learn-${a.id}`,
      kind: "learn",
      title: "Learn item completed",
      description:
        a.outcome === "correct"
          ? "Worked through a problem with hints faded step by step"
          : "Persisted through a hard item — effort that builds understanding",
      xpDelta: a.xp_awarded,
      totalXp: 0,
      level: 0,
      timestamp: a.completed_at,
      principle: "Fading help",
    });
  }

  for (const a of achievements.data ?? []) {
    const def = ACHIEVEMENTS.find((d) => d.key === a.achievement_key);
    events.push({
      id: `achievement-${a.id}`,
      kind: "achievement",
      title: def?.name ?? a.achievement_key.replaceAll("_", " "),
      description: def?.description ?? "Achievement unlocked",
      xpDelta: 0,
      totalXp: 0,
      level: 0,
      timestamp: a.unlocked_at,
      principle: "Grade the process",
      meta: { key: a.achievement_key },
    });
  }

  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  // Walk backwards to compute running XP totals at each event
  let runningXp = profile.xp;
  for (const e of events) {
    e.totalXp = runningXp;
    e.level = levelForXp(runningXp);
    runningXp = Math.max(0, runningXp - e.xpDelta);
  }

  // Insert milestone markers the user has passed
  const milestoneEvents: TimelineEvent[] = MILESTONES.filter(
    (m) => profile.xp >= m.xp,
  ).map((m) => ({
    id: `milestone-${m.xp}`,
    kind: "milestone" as const,
    title: m.title,
    description: `Reached ${m.xp} XP — your brain is doing more of the work`,
    xpDelta: 0,
    totalXp: m.xp,
    level: levelForXp(m.xp),
    timestamp: profile.created_at,
    principle: m.principle,
  }));

  if (profile.streak_current >= 7) {
    events.push({
      id: "streak-current",
      kind: "streak",
      title: `${profile.streak_current}-day recall streak`,
      description: "Days you actually practised retrieval, not just opened the app",
      xpDelta: 0,
      totalXp: profile.xp,
      level: profile.level,
      timestamp: new Date().toISOString(),
      principle: "Scheduled unaided practice",
      meta: { streak: profile.streak_current },
    });
  }

  const merged = [...events, ...milestoneEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const nextMilestone = MILESTONES.find((m) => profile.xp < m.xp) ?? null;
  const xpToNext = nextMilestone ? nextMilestone.xp - profile.xp : 0;

  return NextResponse.json({
    events: merged.slice(0, 50),
    summary: {
      totalXp: profile.xp,
      level: profile.level,
      streakCurrent: profile.streak_current,
      streakLongest: profile.streak_longest,
      nextMilestone: nextMilestone
        ? { xp: nextMilestone.xp, title: nextMilestone.title, xpRemaining: xpToNext }
        : null,
      memberSince: profile.created_at,
    },
  });
}
