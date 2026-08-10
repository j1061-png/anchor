import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingExperience } from "@/components/marketing/experience";
import "./marketing.css";

export const metadata: Metadata = {
  title: "Anchor · Lock distractions. Anchor your focus.",
  description:
    "An interactive exploration of attention, cognitive offloading, and why Anchor exists.",
};

async function maybeRedirectSignedIn() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/today");
  } catch {
    // Serve marketing when env is not configured.
  }
}

export default async function LandingPage() {
  await maybeRedirectSignedIn();
  return <MarketingExperience />;
}
