import Link from "next/link";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  Board,
  Pager,
  PAGE_SIZE,
  LEADERBOARD_TABS,
  type BoardRow,
  type LeaderboardTab,
} from "./board";
import { LeaderboardTabs } from "./tabs";
import { PROGRESS_TABS } from "@/components/progress/tabs";
import { SegmentedNav } from "@/components/ui/segmented";
import { Page, PageHeader } from "@/components/ui/page";
import { Card, Well } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { WhyThis } from "@/components/ui/why-this";

export const metadata = { title: "Most improved" };

type FriendRow = {
  id: string;
  display_name: string | null;
  avatar_emoji: string | null;
  band?: number;
  independence_pct?: number;
};

// A single band boundary so the page and the SQL agree on the buckets.
const BAND_LABELS = ["Starting out", "Building", "Steady", "Strong"];

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
  const rawTab = typeof sp.tab === "string" ? sp.tab : "improved";
  const tab: LeaderboardTab = (LEADERBOARD_TABS as readonly string[]).includes(
    rawTab,
  )
    ? (rawTab as LeaderboardTab)
    : "improved";
  const parsedPage = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
  const from = (page - 1) * PAGE_SIZE;

  const { data: me } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_emoji, leaderboard_opt_in")
    .eq("id", user.id)
    .single();
  if (!me) return null;

  // Opt-in, not opt-out (R3). Friends is exempt — a friend is not a public
  // board, and the existing friends flow already gates on accepted friendship.
  const optedIn = me.leaderboard_opt_in === true && me.display_name !== null;

  let rows: BoardRow[] = [];
  let total = 0;
  let note: string | null = null;
  let empty: string | null = null;
  let errorMsg: string | null = null;
  let showProfileLink = false;
  let bandLabel: string | null = null;
  const metricLabel = tab === "improved" ? "+pts" : "%";

  if (tab !== "friends" && !optedIn) {
    // The board itself is the opt-in surface: explain, and point to profile.
    note = null;
    empty =
      "You're not on the improvement boards. They're off by default. Turn them " +
      "on from your profile — you'll be compared with people at a similar level, " +
      "over the last seven days, on how much you improved, never on a top score.";
    showProfileLink = true;
  } else if (tab === "improved") {
    // My band, so I only rank against similar starting ability.
    const { data: mine } = await supabase
      .from("most_improved_board")
      .select("*")
      .eq("id", me.id)
      .maybeSingle();
    const band = mine?.band ?? null;
    if (band === null) {
      empty =
        "Not enough to compare yet. Play across two weeks and the improvement " +
        "board can measure the change.";
    } else {
      bandLabel = BAND_LABELS[band - 1] ?? `band ${band}`;
      const { data, count } = await supabase
        .from("most_improved_board")
        .select("*", { count: "exact" })
        .eq("band", band)
        .order("improvement_pct", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      total = count ?? 0;
      rows = (data ?? []).map((r, i) => ({
        id: r.id,
        rank: from + i + 1,
        name: r.display_name,
        avatarEmoji: r.avatar_emoji,
        metric: r.improvement_pct,
      }));
      if (rows.length === 0 && page === 1) {
        empty = "Nobody in your band yet. You go first.";
      }
    }
  } else if (tab === "independence") {
    const { data: mine } = await supabase
      .from("independence_board")
      .select("*")
      .eq("id", me.id)
      .maybeSingle();
    const band = mine?.band ?? null;
    if (band === null) {
      empty =
        "Play a few unaided items this week and the independence board can rank you.";
    } else {
      bandLabel = BAND_LABELS[band - 1] ?? `band ${band}`;
      const { data, count } = await supabase
        .from("independence_board")
        .select("*", { count: "exact" })
        .eq("band", band)
        .order("independence_pct", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      total = count ?? 0;
      rows = (data ?? []).map((r, i) => ({
        id: r.id,
        rank: from + i + 1,
        name: r.display_name,
        avatarEmoji: r.avatar_emoji,
        metric: r.independence_pct,
      }));
      if (rows.length === 0 && page === 1) {
        empty = "Nobody in your band yet. You go first.";
      }
    }
  } else {
    // Friends — unchanged flow: accepted friendships via the server route.
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
      empty = "No friends yet. Share your code from your profile.";
      showProfileLink = true;
    } else {
      // Rank friends by their own independence, not a top score.
      const ranked = [...friendRows].sort(
        (a, b) => (b.independence_pct ?? 0) - (a.independence_pct ?? 0),
      );
      total = ranked.length;
      rows = ranked.slice(from, from + PAGE_SIZE).map((r, i) => ({
        id: r.id,
        rank: from + i + 1,
        name: r.display_name ?? "unnamed",
        avatarEmoji: r.avatar_emoji,
        metric: r.independence_pct ?? 0,
      }));
    }
  }

  if (!errorMsg && !empty && rows.length === 0) {
    empty = "Nothing this far down. Go back a page.";
  }

  const heading =
    tab === "improved"
      ? "Most improved"
      : tab === "independence"
        ? "Independence"
        : "Friends";

  const lead =
    tab === "improved"
      ? "How much you moved this week, against people at your level."
      : tab === "independence"
        ? "How often you solved it yourself, against people at your level."
        : "Your friends, by how much they do without help.";

  return (
    <Page width="wide">
      <SegmentedNav items={PROGRESS_TABS} />

      <PageHeader
        eyebrow="Progress"
        title={heading}
        lead={lead}
        action={
          tab !== "friends" && bandLabel ? (
            <Badge tone="cobalt" icon="users">
              Your level: {bandLabel}
            </Badge>
          ) : undefined
        }
      />

      <LeaderboardTabs />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {errorMsg ? (
            <Card>
              <div className="flex items-start gap-3">
                <Icon name="info" size={18} className="mt-0.5 text-text-3" />
                <p className="text-sm leading-relaxed">{errorMsg}</p>
              </div>
            </Card>
          ) : empty ? (
            <Card>
              <p className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-text-2">
                {empty}
              </p>
              {showProfileLink && (
                <Link
                  href="/profile"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-dotted underline-offset-4 hover:text-brand"
                >
                  Open your profile
                  <Icon name="arrowRight" size={15} />
                </Link>
              )}
            </Card>
          ) : (
            <>
              <Board
                rows={rows}
                pinned={null}
                meId={me.id}
                metricLabel={metricLabel}
              />
              {note && (
                <p className="mt-3 px-1 text-sm text-text-2">{note}</p>
              )}
              <Pager tab={tab} page={page} total={total} />
            </>
          )}
        </div>

        {/* The rules, beside the board rather than as a footnote under it. */}
        <Card className="h-full lg:sticky lg:top-6">
          <h2 className="t-section">What this board is</h2>
          <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-text-2">
            <li className="flex gap-2.5">
              <Icon name="clock" size={16} className="mt-0.5 shrink-0 text-text-3" />
              <span>
                The last <span className="num">7</span> days only. It resets, so
                a bad week never follows you.
              </span>
            </li>
            <li className="flex gap-2.5">
              <Icon name="users" size={16} className="mt-0.5 shrink-0 text-text-3" />
              <span>
                You are ranked inside a skill band, against people who started
                near where you did — not against everyone.
              </span>
            </li>
            <li className="flex gap-2.5">
              <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-text-3" />
              <span>
                Off by default. Nobody appears here without turning it on.
              </span>
            </li>
            <li className="flex gap-2.5">
              <Icon name="close" size={16} className="mt-0.5 shrink-0 text-text-3" />
              <span>
                No speed board and no top-score board. Those rank people who
                were already ahead and push everyone else down.
              </span>
            </li>
          </ul>

          <Well className="mt-4 text-xs leading-relaxed text-text-2">
            {tab === "improved" ? (
              <>
                <span className="font-semibold text-text">+pts </span>
                is the change in your unaided solve rate between this week and
                last, in percentage points. Both weeks need at least{" "}
                <span className="num">5</span> unaided items or you are left
                off.
              </>
            ) : (
              <>
                <span className="font-semibold text-text">% </span>
                is the share of items you got right with no hint, over the last{" "}
                <span className="num">7</span> days. It needs at least{" "}
                <span className="num">5</span> unaided items to appear.
              </>
            )}
          </Well>

          <WhyThis k="sharing" className="mt-4" />
        </Card>
      </div>
    </Page>
  );
}
