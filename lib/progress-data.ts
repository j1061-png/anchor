import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { levelProgress, xpForLevel } from "@/lib/xp-events";

export type TimelineEvent = {
  id: string;
  at: string;
  amount: number;
  reason: string;
};

export type TimelineDay = { day: string; xp: number; cumulative: number };

export type Milestone = {
  at: string;
  kind: "level" | "achievement" | "start";
  key: string;
  label: string;
  description: string;
  /** Cumulative XP at that moment, so the marker can sit on the curve. */
  xp: number;
};

export type TimelineResponse = {
  totalXp: number;
  level: number;
  levelFloorXp: number;
  levelCeilXp: number;
  intoLevel: number;
  needed: number;
  fraction: number;
  joinedAt: string;
  events: TimelineEvent[];
  days: TimelineDay[];
  milestones: Milestone[];
};

const ymd = (iso: string) => iso.slice(0, 10);

/** Loose row shapes: xp_events post-dates the hand-written Database types. */
type Row = Record<string, unknown>;

export async function loadTimeline(
  userId: string,
  profileXp: number,
  joinedAt: string,
): Promise<TimelineResponse> {
  const admin = createAdminClient() as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (
          col: string,
          val: string,
        ) => {
          order: (
            col: string,
            o: { ascending: boolean },
          ) => Promise<{ data: Row[] | null }>;
        };
      };
    };
  };

  const [{ data: rawEvents }, { data: rawAchievements }] = await Promise.all([
    admin
      .from("xp_events")
      .select("id, amount, reason_key, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    admin
      .from("achievements")
      .select("achievement_key, unlocked_at")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: true }),
  ]);

  const events: TimelineEvent[] = (rawEvents ?? []).map((r) => ({
    id: String(r.id),
    at: String(r.created_at),
    amount: Number(r.amount),
    reason: String(r.reason_key),
  }));

  // --- Daily series, gap-filled so a quiet week reads as flat, not missing --
  const perDay = new Map<string, number>();
  for (const e of events) {
    perDay.set(ymd(e.at), (perDay.get(ymd(e.at)) ?? 0) + e.amount);
  }

  const days: TimelineDay[] = [];
  if (events.length > 0) {
    const first = new Date(ymd(events[0].at) + "T00:00:00Z");
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    let cumulative = 0;
    for (
      const d = new Date(first);
      d <= today;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const key = d.toISOString().slice(0, 10);
      cumulative += perDay.get(key) ?? 0;
      days.push({ day: key, xp: perDay.get(key) ?? 0, cumulative });
    }
  }

  // --- Milestones ----------------------------------------------------------
  // Seeded and imported history can predate the profile row, which would sort
  // the start marker into the middle of the climb. Anchor it to whichever came
  // first so it is always the bottom of the timeline.
  const firstEventAt = events[0]?.at;
  const startAt =
    firstEventAt && firstEventAt < joinedAt ? firstEventAt : joinedAt;

  const milestones: Milestone[] = [
    {
      at: startAt,
      kind: "start",
      key: "joined",
      label: "Started Anchor",
      description: "The day you decided to do the thinking yourself.",
      xp: 0,
    },
  ];

  // Level-ups are derivable from the ledger: walk the running total and record
  // the moment each threshold is crossed.
  let running = 0;
  let level = 0;
  for (const e of events) {
    running += e.amount;
    const now = Math.floor(Math.sqrt(Math.max(0, running) / 100));
    while (now > level) {
      level += 1;
      milestones.push({
        at: e.at,
        kind: "level",
        key: `level-${level}`,
        label: `Reached level ${level}`,
        description: `${xpForLevel(level).toLocaleString()} XP earned, weighted towards work you did unaided.`,
        xp: running,
      });
    }
  }

  const cumulativeAt = (iso: string) => {
    const key = ymd(iso);
    let last = 0;
    for (const d of days) {
      if (d.day > key) break;
      last = d.cumulative;
    }
    return last;
  };

  for (const a of rawAchievements ?? []) {
    const def = ACHIEVEMENTS.find((d) => d.key === String(a.achievement_key));
    if (!def || !a.unlocked_at) continue;
    const at = String(a.unlocked_at);
    milestones.push({
      at,
      kind: "achievement",
      key: def.key,
      label: def.name,
      description: def.description,
      xp: cumulativeAt(at),
    });
  }

  milestones.sort((a, b) => a.at.localeCompare(b.at));

  const lvl = levelProgress(profileXp);

  return {
    totalXp: profileXp,
    level: lvl.level,
    levelFloorXp: lvl.floorXp,
    levelCeilXp: lvl.ceilXp,
    intoLevel: lvl.intoLevel,
    needed: lvl.needed,
    fraction: lvl.fraction,
    joinedAt,
    events: events.slice(-400).reverse(),
    days,
    milestones,
  };
}
