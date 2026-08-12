/**
 * Public production defaults — mirrors `.env.production` in the repo.
 * Vercel imports often leave dashboard env vars empty, which overrides build-time
 * values on the server; these fallbacks keep hosted deploys working.
 */
export const PUBLIC_DEPLOY_CONFIG = {
  supabaseUrl: "https://lqjttptaawsfqegngjyl.supabase.co",
  supabaseAnonKey: "sb_publishable_FGSUpm9cb0--oGHPJgn-9A_gCTRPj8P",
  siteUrl: "https://anchor-one-zeta.vercel.app",
  appleAuthEnabled: true,
} as const;
