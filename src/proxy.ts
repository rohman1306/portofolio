import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseUrl, supabaseKey, isSupabaseConfigured } from "@/supabase/env";

const protectedRoutes = ["/dashboard", "/holdings", "/goals", "/learning", "/allocation", "/settings", "/aadmin-k23hdnhsd"];
// /reset-password is intentionally excluded: a Supabase password-recovery session is
// an authenticated session, so redirecting signed-in users away would break the reset flow.
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          return cookies.map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              supabaseResponse.headers.set(key, value);
            });
          }
        },
      },
    }
  );

  const user = isSupabaseConfigured
    ? (await supabase.auth.getUser()).data.user
    : null;

  const pathname = request.nextUrl.pathname;

  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && authRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Alias for compatibility
export const proxy = middleware;
export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
