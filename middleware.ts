import { NextResponse, type NextRequest } from "next/server.js";
import { createServerClient } from "@supabase/ssr";

// Every signed-in route. The list used to omit /learn, /review, /progress,
// /independence, /brain-only, /journal and /about-the-evidence, so a deep link
// to any of them fell through to the layout's redirect, which loses the ?next=
// return path — you signed in and landed on /today instead of where you were
// going. Keep this in step with the (app) route group.
const GUARDED = [
  "/today",
  "/learn",
  "/review",
  "/journal",
  "/progress",
  "/independence",
  "/dashboard",
  "/leaderboard",
  "/brain-only",
  "/about-the-evidence",
  "/profile",
  "/session",
  "/practice",
  "/onboarding",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/share|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
