import { PUBLIC_DEPLOY_CONFIG } from "@/lib/public-config";

/** Public Supabase config — safe to read on server and client (NEXT_PUBLIC_*). */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || PUBLIC_DEPLOY_CONFIG.supabaseUrl;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    PUBLIC_DEPLOY_CONFIG.supabaseAnonKey;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}

export function getServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key || null;
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    PUBLIC_DEPLOY_CONFIG.siteUrl ||
    "http://localhost:3000"
  );
}

export function isAppleAuthEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED?.trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return PUBLIC_DEPLOY_CONFIG.appleAuthEnabled;
}
