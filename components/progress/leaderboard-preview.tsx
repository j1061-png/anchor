import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";

const BAND_LABELS = ["Starting out", "Building", "Steady", "Strong"];

export async function LeaderboardPreview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: me } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_emoji, leaderboard_opt_in")
    .eq("id", user.id)
    .single();

  if (!me?.leaderboard_opt_in) {
    return (
      <section className="hero-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate">Progress ranks</p>
            <h2 className="mt-1 font-display text-lg font-extrabold text-navy">Join the improvement board</h2>
            <p className="mt-2 text-sm text-slate">
              See how you rank against classmates at your level — on improvement and
              independence, never top scores.
            </p>
          </div>
        </div>
        <Link
          href="/profile"
          className="mt-4 inline-flex items-center rounded-(--radius-pill) bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          Turn on in profile
        </Link>
      </section>
    );
  }

  const { data: mine } = await supabase
    .from("most_improved_board")
    .select("*")
    .eq("id", me.id)
    .maybeSingle();

  const band = mine?.band ?? null;
  let rows: { id: string; rank: number; name: string; avatar: string | null; metric: number; isMe: boolean }[] = [];

  if (band !== null) {
    const { data } = await supabase
      .from("most_improved_board")
      .select("*")
      .eq("band", band)
      .order("improvement_pct", { ascending: false })
      .limit(5);
    rows = (data ?? []).map((r, i) => ({
      id: r.id,
      rank: i + 1,
      name: r.display_name,
      avatar: r.avatar_emoji,
      metric: r.improvement_pct,
      isMe: r.id === me.id,
    }));
  }

  return (
    <section className="hero-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate">Progress ranks</p>
          <h2 className="mt-1 font-display text-lg font-extrabold text-navy">
            {band ? `${BAND_LABELS[band - 1] ?? "Your band"}` : "Building your rank"}
          </h2>
        </div>
        <Link href="/leaderboard" className="text-sm font-semibold text-navy underline underline-offset-4">
          View all
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate">
          Play across two weeks and your rank appears here.
        </p>
      ) : (
        <ol className="mt-4 grid gap-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                r.isMe ? "bg-accent-soft ring-1 ring-navy/10" : "bg-mist/40"
              }`}
            >
              <span className="num w-6 text-center text-xs font-semibold text-slate">{r.rank}</span>
              <Avatar avatarId={r.avatar} name={r.name} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{r.name}</span>
              <span className="num text-sm font-semibold text-navy">+{r.metric}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
