// Share cards, 1080x1080, drawn server-side with next/og. Palette hexes are
// inlined because satori has no CSS variables. Text renders in the og default
// face (Noto Sans): pulling Google fonts into satori at request time is flaky,
// so the cards trade the app's type stack for reliability.
//
// Privacy: a card is public by definition — anyone with the URL can fetch it,
// and the middleware matcher lets /api/share through unauthenticated. So every
// card type gates on profiles.leaderboard_opt_in, the opt-IN column added by
// 20260805000100_leaderboards.sql. The older public_leaderboard column defaults
// TRUE, so gating on it published cards for users who never agreed to anything.

import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACHIEVEMENTS } from "@/lib/achievements";
import {
  RANGE_LABEL,
  parseRange,
  type ProgressStats,
  type ShareRange,
} from "@/lib/share";
import { loadProgressStats } from "@/lib/share-stats";
import type { SupabaseClient } from "@supabase/supabase-js";

const PAPER = "#e4e7dc";
const INK = "#16190f";
const SLATE = "#5d6852";
const FLAG = "#e01b54";
const GOLD = "#f0b429";
const CHALK = "#f7f8f4";
const GRID = "rgba(22,25,15,0.08)";

const SIZE = 1080;

/**
 * Cache policy. Rendering a 1080² image is the most expensive thing this app
 * does per request, so anything whose content can never change again is cached
 * at the edge for a year; anything that moves with the user is cached briefly
 * and served stale while it revalidates.
 */
const CACHE_IMMUTABLE =
  "public, max-age=86400, s-maxage=31536000, immutable";
const CACHE_LIVE =
  "public, max-age=300, s-maxage=900, stale-while-revalidate=86400";

const paramsSchema = z.object({
  type: z.enum(["score", "streak", "achievement", "progress"]),
  id: z.string().uuid(),
});

// Never cached: a 404 here usually means "has not opted in yet", and that
// should stop being true the moment they do.
const notFound = () =>
  NextResponse.json(
    { error: "No share card at that address. Check the link." },
    { status: 404, headers: { "cache-control": "no-store" } },
  );

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Fixed-colour copy of components/wordmark.tsx — keep the geometry in sync. */
function OgWordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={72} height={72} viewBox="0 0 24 24" fill="none">
        <path
          d="M9.4 7.2V5.6a2.6 2.6 0 0 1 5.2 0v1.6"
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="7.4" y="7.2" width="9.2" height="5.2" rx="1.7" fill={INK} />
        <circle cx="12" cy="9.8" r="1.2" fill={FLAG} />
        <path
          d="M12 12.4v9.9"
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4.8 15.2a7.2 7.2 0 0 0 14.4 0M4.8 15.4v-2.8M19.2 15.4v-2.8"
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ fontSize: 64, fontWeight: 700, color: INK, letterSpacing: -2 }}>
        anchor
      </div>
    </div>
  );
}

function card(children: React.ReactNode, cacheControl = CACHE_IMMUTABLE) {
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 88,
          backgroundColor: PAPER,
          backgroundImage: `linear-gradient(to right, ${GRID} 2px, transparent 2px), linear-gradient(to bottom, ${GRID} 2px, transparent 2px)`,
          backgroundSize: "40px 40px",
          color: INK,
        }}
      >
        <OgWordmark />
        {children}
        <div style={{ display: "flex", fontSize: 34, color: SLATE }}>
          Five puzzles a day. No help for the first 45 seconds.
        </div>
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      headers: { "cache-control": cacheControl },
    },
  );
}

/** A bordered figure block: the number, then what the number counts. */
function Tile({
  value,
  label,
  accent = INK,
}: {
  value: number | string;
  label: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        flexBasis: 0,
        padding: "24px 26px",
        borderRadius: 16,
        backgroundColor: CHALK,
        border: `3px solid ${INK}`,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 74,
          fontWeight: 700,
          lineHeight: 1,
          color: accent,
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", fontSize: 28, color: SLATE, marginTop: 12 }}>
        {label}
      </div>
    </div>
  );
}

/**
 * The progress card. Leads with unaided solves — the one figure that means the
 * work was yours — then recall days, brain-only sessions and milestones. No
 * score, no accuracy percentage, no ranking.
 */
function ProgressCard({
  name,
  range,
  stats,
  includeStreak,
}: {
  name: string;
  range: ShareRange;
  stats: ProgressStats;
  includeStreak: boolean;
}) {
  const pct =
    stats.finished > 0
      ? Math.max(3, Math.round((stats.unaidedSolves / stats.finished) * 100))
      : 0;

  const tiles: React.ReactNode[] = [];
  if (includeStreak) {
    tiles.push(
      <Tile
        key="recall"
        value={stats.recallDays}
        label={stats.recallDays === 1 ? "day of recall" : "days of recall"}
        accent={FLAG}
      />,
    );
  }
  if (stats.brainOnly !== null) {
    tiles.push(
      <Tile
        key="brain"
        value={stats.brainOnly}
        label={
          stats.brainOnly === 1 ? "brain-only session" : "brain-only sessions"
        }
      />,
    );
  }
  tiles.push(
    <Tile
      key="milestones"
      value={stats.milestones}
      label={stats.milestones === 1 ? "milestone" : "milestones"}
      accent={GOLD}
    />,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ display: "flex", fontSize: 36, color: SLATE }}>
        {name} · {RANGE_LABEL[range]}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 26,
          marginTop: 6,
        }}
      >
        {/* Every div carries an explicit display: satori throws without it,
            and the thrown card is an unrenderable 500, not a fallback. */}
        <div
          style={{
            display: "flex",
            fontSize: 268,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {stats.unaidedSolves}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 700 }}>
            solved
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 58,
              fontWeight: 700,
              color: FLAG,
            }}
          >
            unaided
          </div>
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 34, color: SLATE, marginTop: 10 }}>
        {stats.finished > 0
          ? `out of ${stats.finished} finished — no hint, no worked solution`
          : "no items finished in this window yet"}
      </div>

      {stats.finished > 0 && (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 26,
            marginTop: 26,
            borderRadius: 13,
            backgroundColor: CHALK,
            border: `3px solid ${INK}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              width: `${pct}%`,
              height: "100%",
              backgroundColor: FLAG,
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 22, marginTop: 34 }}>{tiles}</div>
    </div>
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) return notFound();
  const { type, id } = parsed.data;
  const admin = createAdminClient();

  if (type === "score") {
    const { data: session } = await admin
      .from("sessions")
      .select("user_id, score, accuracy, date, status")
      .eq("id", id)
      .maybeSingle();
    if (!session || session.status !== "complete") return notFound();

    const { data: owner } = await admin
      .from("profiles")
      .select("display_name, leaderboard_opt_in")
      .eq("id", session.user_id)
      .maybeSingle();
    // Not opted in, no public card. Nothing leaks.
    if (!owner?.leaderboard_opt_in) return notFound();

    const solved = Math.round((session.accuracy ?? 0) * 5);
    return card(
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 40, color: SLATE }}>
          {owner.display_name ?? "An anchor player"} · {fmtDate(session.date)}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 28,
            marginTop: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 340,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {session.score ?? 0}
          </div>
          <div style={{ display: "flex", fontSize: 52, color: SLATE }}>
            score
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 52, marginTop: 12 }}>
          {solved}/5 solved
        </div>
      </div>,
      // A completed session's figures never change again.
      CACHE_IMMUTABLE,
    );
  }

  if (type === "progress") {
    const { data: owner } = await admin
      .from("profiles")
      .select("display_name, streak_current, leaderboard_opt_in")
      .eq("id", id)
      .maybeSingle();
    if (!owner?.leaderboard_opt_in) return notFound();

    const search = new URL(request.url).searchParams;
    const range = parseRange(search.get("range"));
    // Streak is opt-out per card: the sharer chooses in the UI.
    const includeStreak = search.get("streak") !== "0";

    const stats = await loadProgressStats(
      admin as unknown as SupabaseClient,
      id,
      range,
      owner.streak_current,
    );

    return card(
      <ProgressCard
        name={owner.display_name ?? "An anchor player"}
        range={range}
        stats={stats}
        includeStreak={includeStreak}
      />,
      // These counts move as the user practises.
      CACHE_LIVE,
    );
  }

  if (type === "streak") {
    const { data: owner } = await admin
      .from("profiles")
      .select("display_name, streak_current, leaderboard_opt_in")
      .eq("id", id)
      .maybeSingle();
    if (!owner?.leaderboard_opt_in) return notFound();

    const streak = owner.streak_current;
    const filled = Math.min(16, streak);
    return card(
      <div style={{ display: "flex", alignItems: "center", gap: 72 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 40, color: SLATE }}>
            {owner.display_name ?? "An anchor player"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 300,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {streak}
          </div>
          <div style={{ display: "flex", fontSize: 52 }}>
            day{streak === 1 ? "" : "s"} of recall practice
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} style={{ display: "flex", gap: 14 }}>
              {[0, 1, 2, 3].map((col) => {
                const on = row * 4 + col < filled;
                return (
                  <div
                    key={col}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 6,
                      backgroundColor: on ? FLAG : CHALK,
                      border: `3px solid ${on ? FLAG : SLATE}`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>,
      // The streak changes daily.
      CACHE_LIVE,
    );
  }

  // Achievement.
  const { data: row } = await admin
    .from("achievements")
    .select("user_id, achievement_key, unlocked_at")
    .eq("id", id)
    .maybeSingle();
  if (!row) return notFound();

  const { data: owner } = await admin
    .from("profiles")
    .select("display_name, leaderboard_opt_in")
    .eq("id", row.user_id)
    .maybeSingle();
  if (!owner?.leaderboard_opt_in) return notFound();

  const def = ACHIEVEMENTS.find((a) => a.key === row.achievement_key);
  const name = def?.name ?? row.achievement_key.replace(/[-_]+/g, " ");
  return card(
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: 12,
          backgroundColor: GOLD,
          border: `4px solid ${INK}`,
        }}
      />
      <div
        style={{
          display: "flex",
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 1.05,
          marginTop: 44,
        }}
      >
        {name}
      </div>
      {def?.description && (
        <div style={{ display: "flex", fontSize: 44, color: SLATE, marginTop: 18 }}>
          {def.description}
        </div>
      )}
      <div style={{ display: "flex", fontSize: 40, color: SLATE, marginTop: 28 }}>
        {owner.display_name ?? "An anchor player"} ·{" "}
        {fmtDate(row.unlocked_at.slice(0, 10))}
      </div>
    </div>,
    // An unlock is a fact about a past date; it will not change.
    CACHE_IMMUTABLE,
  );
}
