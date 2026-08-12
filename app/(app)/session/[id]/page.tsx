import { createClient } from "@/lib/supabase/server";
import { SessionPlayer } from "./player";

export const metadata = { title: "Session" };

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let friendCode: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("friend_code")
      .eq("id", user.id)
      .single();
    friendCode = profile?.friend_code ?? undefined;
  }
  return <SessionPlayer sessionId={id} friendCode={friendCode} />;
}
