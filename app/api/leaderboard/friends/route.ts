import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Friends leaderboard data. Accepted friends see each other's numbers even
// when a profile is off the public boards (§9), which RLS cannot express, so
// this route verifies the caller and their friendships, then reads the
// friend profiles with the service role. No input to validate: the only
// parameter is the caller's identity, taken from the session.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to see friends." },
      { status: 401 },
    );
  }

  const admin = createAdminClient();

  const { data: friendships, error: friendshipError } = await admin
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
  if (friendshipError) {
    return NextResponse.json(
      { error: "Friends didn't load. Refresh to retry." },
      { status: 500 },
    );
  }

  // The caller ranks among their friends, so their own row rides along.
  const ids = new Set<string>([user.id]);
  for (const f of friendships ?? []) {
    ids.add(f.requester_id === user.id ? f.addressee_id : f.requester_id);
  }

  const { data: rows, error: profileError } = await admin
    .from("profiles")
    .select("id, display_name, avatar_emoji, xp, cognitive_score, streak_current")
    .in("id", [...ids])
    .not("display_name", "is", null)
    .order("cognitive_score", { ascending: false })
    .order("id", { ascending: true });
  if (profileError) {
    return NextResponse.json(
      { error: "Friends didn't load. Refresh to retry." },
      { status: 500 },
    );
  }

  return NextResponse.json({ rows: rows ?? [] });
}
