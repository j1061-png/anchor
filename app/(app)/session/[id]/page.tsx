import { createClient } from "@/lib/supabase/server";
import { SessionPlayer } from "./player";

export const metadata = { title: "Session" };

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The recap is the app's highest-traffic share surface, so the friend code
  // has to reach it: without it every link shared from a finished session
  // loses its ?ref= and the referral credit never lands.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select("friend_code, leaderboard_opt_in")
          .eq("id", user.id)
          .maybeSingle()
      ).data
    : null;

  return (
    <SessionPlayer
      sessionId={id}
      friendCode={profile?.friend_code}
      sharingOptedIn={profile?.leaderboard_opt_in ?? false}
    />
  );
}
