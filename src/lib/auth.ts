import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export type Session = Awaited<ReturnType<typeof auth.getSession>>["data"];

export async function getSession(): Promise<Session> {
  const { data } = await auth.getSession();
  return data;
}
