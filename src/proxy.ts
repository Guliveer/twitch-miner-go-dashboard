import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { neon } from "@neondatabase/serverless";

const SESSION_TOKEN_COOKIE = "__Secure-neon-auth.session_token";
const SESSION_DATA_COOKIE = "__Secure-neon-auth.local.session_data";

async function getSessionFromRequest(req: NextRequest) {
  const hasSessionToken = req.cookies.has(SESSION_TOKEN_COOKIE);
  if (!hasSessionToken) return null;

  const sessionDataCookieValue = req.cookies.get(SESSION_DATA_COOKIE)?.value;
  if (sessionDataCookieValue) {
    try {
      const secret = new TextEncoder().encode(
        process.env.NEON_AUTH_COOKIE_SECRET!
      );
      const { payload } = await jwtVerify(sessionDataCookieValue, secret, {
        algorithms: ["HS256"],
      });
      const data = payload as { session?: unknown; user?: { id?: string } };
      if (data.session && data.user?.id) {
        return data as { session: unknown; user: { id: string } };
      }
    } catch {
      // Cookie expired or invalid — fall through to upstream call
    }
  }

  const sessionToken = req.cookies.get(SESSION_TOKEN_COOKIE)!.value;
  const res = await fetch(`${process.env.NEON_AUTH_BASE_URL!}/get-session`, {
    headers: { Cookie: `${SESSION_TOKEN_COOKIE}=${sessionToken}` },
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.session || !data?.user?.id) return null;
  return data as { session: unknown; user: { id: string } };
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/change-password");
  const isAdmin = pathname.startsWith("/admin");

  const session = await getSessionFromRequest(req);

  if (!session) {
    if (isAuthPage) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const sql = neon(process.env.DB_DSN!);
  const rows = await sql`
    SELECT must_change_password, role
    FROM user_meta
    WHERE user_id = ${session.user.id}
    LIMIT 1
  `;
  const meta = rows[0] as
    | { must_change_password: boolean; role: string }
    | undefined;

  if (meta?.must_change_password && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }

  if (isAdmin && meta?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
