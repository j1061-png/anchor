import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";

// Shell for every signed-in page. Middleware guards most of these routes; the
// user check here covers the rest and is the gate for /learn, /review,
// /progress, /journal and /brain-only, which middleware does not list.
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_emoji, streak_current")
    .eq("id", user.id)
    .single();

  // No display name means onboarding never finished.
  if (!profile?.display_name) redirect("/onboarding");

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--r-sm)] focus:bg-text focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-canvas"
      >
        Skip to content
      </a>

      <Nav
        displayName={profile.display_name}
        avatarEmoji={profile.avatar_emoji}
        streak={profile.streak_current}
      />

      {/* Pages set their own max-width with <Page width="...">; the shell only
          owns gutters and the clearance for the mobile tab bar. */}
      <main
        id="main"
        className="pb-tabbar mx-auto w-full max-w-[88rem] px-4 pt-6 sm:px-6 sm:pb-16 sm:pt-10"
      >
        {children}
      </main>
    </div>
  );
}
