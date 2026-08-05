import Link from "next/link";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardViewRow } from "@/lib/database.types";
import {
  Board,
  Pager,
  PAGE_SIZE,
  LEADERBOARD_TABS,
  type BoardRow,
  type LeaderboardTab,
} from "./board";
import { LeaderboardTabs } from "./tabs";

export const metadata = { title: "Ranks" };

type FriendRow = {
  id: string;
  display_name: string | null;
  avatar_emoji: string | null;
  xp: number;
  cognitive_score: number;
  streak_current: number;
};

const OPT_OUT_NOTE =
  "You're off public boards. Turn them on from your profile to get ranked.";

const viewRow = (
  r: LeaderboardViewRow,
  rank: number,
  metric: number,
): BoardRow => ({
  id: r.id,
  rank,
  name: r.display_name,
  avatarEmoji: r.avatar_emoji,
  metric,
  streak: r.streak_current,
});

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // middleware guards this

  const sp = await searchParams;
  const rawTab = typeof sp.tab === "string" ? sp.tab : "global";
  const tab: LeaderboardTab = (LEADERBOARD_TABS as readonly string[]).includes(
    rawTab,
  )
    ? (rawTab as LeaderboardTab)
    : "global";
  const parsedPage = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
  const from = (page - 1) * PAGE_SIZE;

  const { data: me } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_emoji, school, xp, cognitive_score, streak_current, public_leaderboard",
    )
    .eq("id", user.id)
    .single();
  if (!me) return null;

  const meVisible = me.public_leaderboard && me.display_name !== null;
  const metricLabel = tab === "weekly" ? "xp" : "score";

  const ownRow = (rank: number, metric: number): BoardRow => ({
    id: me.id,
    rank,
    name: me.display_name ?? "you",
    avatarEmoji: me.avatar_emoji,
    metric,
    streak: me.streak_current,
  });

  let rows: BoardRow[] = [];
  let total = 0;
  let pinned: BoardRow | null = null;
  let note: string | null = null;
  let empty: string | null = null;
  let errorMsg: string | null = null;
  let showProfileLink = false;

  if (tab === "global") {
    const { data, count } = await supabase
      .from("leaderboard_view")
      .select("*", { count: "exact" })
      .order("cognitive_score", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    total = count ?? 0;
    rows = (data ?? []).map((r, i) => viewRow(r, from + i + 1, r.cognitive_score));
    if (!meVisible) {
      note = OPT_OUT_NOTE;
    } else if (!rows.some((r) => r.id === me.id)) {
      const { count: above } = await supabase
        .from("leaderboard_view")
        .select("id", { count: "exact", head: true })
        .gt("cognitive_score", me.cognitive_score);
      pinned = ownRow((above ?? 0) + 1, me.cognitive_score);
    }
    if (rows.length === 0 && page === 1) {
      empty = "Nobody on the board yet. Finish a session and take the first spot.";
    }
  } else if (tab === "weekly") {
    const { data: mv, count } = await supabase
      .from("weekly_leaderboard")
      .select("*", { count: "exact" })
      .order("xp", { ascending: false })
      .order("user_id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    total = count ?? 0;
    const ids = (mv ?? []).map((m) => m.user_id);
    const byId = new Map<string, LeaderboardViewRow>();
    if (ids.length > 0) {
      const { data: viewRows } = await supabase
        .from("leaderboard_view")
        .select("*")
        .in("id", ids);
      for (const v of viewRows ?? []) byId.set(v.id, v);
    }
    for (const m of mv ?? []) {
      const v = byId.get(m.user_id);
      // weekly_leaderboard already filters opt-outs, so counts, ranks and
      // this page agree; a missing view row would only mean a mid-request
      // profile change.
      if (!v) continue;
      rows.push(viewRow(v, from + rows.length + 1, m.xp));
    }
    if (!meVisible) {
      note = OPT_OUT_NOTE;
    } else if (!rows.some((r) => r.id === me.id)) {
      const { data: myWeek } = await supabase
        .from("weekly_leaderboard")
        .select("xp")
        .eq("user_id", me.id)
        .maybeSingle();
      if (myWeek) {
        const { count: above } = await supabase
          .from("weekly_leaderboard")
          .select("user_id", { count: "exact", head: true })
          .gt("xp", myWeek.xp);
        pinned = ownRow((above ?? 0) + 1, myWeek.xp);
      } else {
        note = "Nothing from you this week yet. Finish today's session to get on the board.";
      }
    }
    if (rows.length === 0 && page === 1) {
      empty = "No xp banked this week yet. Finish today's five and go first.";
    }
  } else if (tab === "school") {
    if (!me.school) {
      empty = "Add your school on your profile and classmates show up here.";
      showProfileLink = true;
    } else {
      const { data, count } = await supabase
        .from("leaderboard_view")
        .select("*", { count: "exact" })
        .eq("school", me.school)
        .order("cognitive_score", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      total = count ?? 0;
      rows = (data ?? []).map((r, i) =>
        viewRow(r, from + i + 1, r.cognitive_score),
      );
      if (!meVisible) {
        note = OPT_OUT_NOTE;
      } else if (!rows.some((r) => r.id === me.id)) {
        const { count: above } = await supabase
          .from("leaderboard_view")
          .select("id", { count: "exact", head: true })
          .eq("school", me.school)
          .gt("cognitive_score", me.cognitive_score);
        pinned = ownRow((above ?? 0) + 1, me.cognitive_score);
      }
      if (rows.length === 0 && page === 1) {
        empty =
          "Nobody from your school is ranked yet. Finish a session and go first.";
      }
    }
  } else {
    // Friends: accepted friendships include private profiles, so the data
    // comes from a server route that verifies the friendship first.
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    const origin = host
      ? `${proto}://${host}`
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
    const cookieHeader = (await cookies())
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    let friendRows: FriendRow[] | null = null;
    try {
      const res = await fetch(`${origin}/api/leaderboard/friends`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      });
      if (res.ok) {
        const body = (await res.json()) as { rows: FriendRow[] };
        friendRows = body.rows;
      }
    } catch {
      // fall through to the error card
    }

    if (!friendRows) {
      errorMsg = "Friends didn't load. Refresh to retry.";
    } else if (friendRows.length <= 1) {
      // Only the caller's own row: no accepted friends yet.
      empty = "No friends yet. Share your code from your profile.";
      showProfileLink = true;
    } else {
      total = friendRows.length;
      rows = friendRows.slice(from, from + PAGE_SIZE).map((r, i) => ({
        id: r.id,
        rank: from + i + 1,
        name: r.display_name ?? "unnamed",
        avatarEmoji: r.avatar_emoji,
        metric: r.cognitive_score,
        streak: r.streak_current,
      }));
      if (!rows.some((r) => r.id === me.id)) {
        const idx = friendRows.findIndex((r) => r.id === me.id);
        if (idx >= 0) pinned = ownRow(idx + 1, me.cognitive_score);
      }
    }
  }

  if (!errorMsg && !empty && rows.length === 0) {
    empty = "Nothing this far down. Go back a page.";
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Ranks
        </h1>
        <p className="mt-1 text-sm text-slate">Where you stand.</p>
      </header>

      <LeaderboardTabs />

      {tab === "weekly" && (
        <p className="text-xs text-slate">
          xp since Monday <span className="num">00:00</span> UTC
        </p>
      )}
      {tab === "school" && me.school && !empty && (
        <p className="truncate text-xs text-slate">{me.school}</p>
      )}

      {errorMsg ? (
        <section className="plane p-6">
          <p className="text-sm">{errorMsg}</p>
        </section>
      ) : empty ? (
        <section className="plane p-6">
          <p className="max-w-sm text-sm">{empty}</p>
          {showProfileLink && (
            <Link
              href="/profile"
              className="mt-3 inline-block text-sm font-semibold underline decoration-slate underline-offset-4 hover:decoration-ink"
            >
              Open your profile
            </Link>
          )}
        </section>
      ) : (
        <Board rows={rows} pinned={pinned} meId={me.id} metricLabel={metricLabel} />
      )}

      {!errorMsg && !empty && note && (
        <p className="px-1 text-sm text-slate">{note}</p>
      )}
      {!errorMsg && <Pager tab={tab} page={page} total={total} />}
    </div>
  );
}
