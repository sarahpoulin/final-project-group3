import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type RequireAdminResult =
  | {
      ok: true;
      session: Session;
      response: null;
    }
  | {
      ok: false;
      session: null;
      response: NextResponse;
    };

/** Optional context for auth() so it can read cookies from the request (e.g. when called from API routes). */
type AuthContext = { params?: Promise<Record<string, string>> | Record<string, string> };

/** Parse session token from request Cookie header (next-auth.session-token or __Secure- variant). */
function getSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    /(?:^|;)\s*(?:next-auth\.session-token|__Secure-next-auth\.session-token)=([^;]+)/,
  );
  return match ? decodeURIComponent(match[1].trim()) : null;
}

/** Call auth with request/ctx so it reads the session cookie from the incoming request. */
const getSession = async (
  request?: Request,
  ctx?: AuthContext,
): Promise<Session | null> => {
  if (request != null) {
    return (await (auth as (req: Request, ctx?: AuthContext) => Promise<Session | null>)(request, ctx)) as Session | null;
  }
  return (await auth()) as Session | null;
};

export async function requireAdmin(
  request?: Request,
  ctx?: AuthContext,
): Promise<RequireAdminResult> {
  const session = await getSession(request, ctx);

  if (!session) {
    console.error("[requireAdmin] 401: no session (missing or invalid cookie)");
    return {
      ok: false,
      session: null,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (session.user?.isAdmin === true) {
    return {
      ok: true,
      session,
      response: null,
    };
  }

  const userId = (session.user as { id?: string } | undefined)?.id;
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    if (dbUser?.isAdmin) {
      return {
        ok: true,
        session,
        response: null,
      };
    }
  }

  if (request) {
    const sessionToken = getSessionTokenFromRequest(request);
    if (sessionToken) {
      const dbSession = await prisma.session.findUnique({
        where: { sessionToken },
        select: {
          expires: true,
          user: { select: { isAdmin: true } },
        },
      });
      if (dbSession && dbSession.expires > new Date() && dbSession.user?.isAdmin) {
        return {
          ok: true,
          session,
          response: null,
        };
      }
    }
  }

  console.error("[requireAdmin] 403: session exists but user is not admin", {
    email: session.user?.email ?? "(no email)",
    isAdmin: session.user?.isAdmin,
    userId: userId ?? "(no id)",
  });
  return {
    ok: false,
    session: null,
    response: NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    ),
  };
}

export type VerifyAdminResult =
  | { ok: true; user: { isAdmin: true } }
  | { ok: false; response: NextResponse };

/**
 * Validates the request by checking the session and verifying isAdmin from the database.
 * Use this for individual resource operations (e.g. PATCH/DELETE /api/projects/[id]).
 * Pass the request (and optional ctx) so auth() can read the session cookie.
 */
export async function verifyAdmin(
  request?: Request,
  ctx?: AuthContext,
): Promise<VerifyAdminResult> {
  const session = await getSession(request, ctx);

  if (!session) {
    console.error("[verifyAdmin] 401: no session");
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    if (user?.isAdmin) {
      return { ok: true, user: { isAdmin: true } };
    }
    console.error("[verifyAdmin] 403: user in DB is not admin", {
      email: session.user.email,
      dbIsAdmin: user?.isAdmin,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  if (request) {
    const sessionToken = getSessionTokenFromRequest(request);
    if (sessionToken) {
      const dbSession = await prisma.session.findUnique({
        where: { sessionToken },
        select: {
          expires: true,
          user: { select: { isAdmin: true } },
        },
      });
      if (dbSession && dbSession.expires > new Date() && dbSession.user?.isAdmin) {
        return { ok: true, user: { isAdmin: true } };
      }
      if (dbSession && !dbSession.user?.isAdmin) {
        console.error("[verifyAdmin] 403: user in DB is not admin (from session lookup)");
        return {
          ok: false,
          response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
      }
    }
  }

  console.error("[verifyAdmin] 401: no email and no valid session token", {
    hasSession: !!session,
    hasEmail: !!session?.user?.email,
  });
  return {
    ok: false,
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}

