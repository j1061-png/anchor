import { NextResponse, type NextRequest } from "next/server.js";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/env";

const GUARDED = [
  "/today",
  "/learn",
  "/review",
  "/independence",
  "/journal",
  "/brain-only",
  "/about-the-evidence",
  "/iphone",
  "/dashboard",
  "/leaderboard",
  "/profile",
  "/session",
  "/practice",
  "/onboarding",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const config = getSupabasePublicConfig();
  if (!config) {
    return response;
  }

  const supabase = createServerClient(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session on every request. Do not run logic between client
  // creation and getUser(); the token refresh happens inside this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/today";
    return NextResponse.redirect(url);
  }

  const guarded = GUARDED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && guarded) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/share|research/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)",
  ],
};
