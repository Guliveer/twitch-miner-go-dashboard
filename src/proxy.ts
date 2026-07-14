import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

async function getSessionFromRequest(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabaseResponse, supabase };
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/change-password");
  const isAdmin = pathname.startsWith("/admin");

  const { user, supabaseResponse, supabase } = await getSessionFromRequest(req);

  if (!user) {
    if (isAuthPage) return supabaseResponse;
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const { data: meta } = await supabase
    .from("user_meta")
    .select("must_change_password, role")
    .eq("user_id", user.id)
    .single();

  if (meta?.must_change_password && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }

  if (isAdmin && meta?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
