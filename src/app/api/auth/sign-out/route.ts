import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  let didSignOut = false;
  try {
    const a: any = await auth();
    const userId: string | null = a?.userId ?? null;
    const sessionId: string | null = a?.sessionId ?? a?.sessionClaims?.sid ?? null;
    const signOutFn: (() => Promise<void>) | undefined = a?.signOut;
    if (typeof signOutFn === 'function') {
      await signOutFn();
      didSignOut = true;
    }
    if (!didSignOut && sessionId) {
      try {
        const client: any = await (clerkClient as any)();
        if (client?.sessions?.revokeSession) await client.sessions.revokeSession(sessionId);
        didSignOut = true;
      } catch {}
    }
    if (!didSignOut && userId) {
      try {
        const client: any = await (clerkClient as any)();
        const sessions = await client.sessions.getSessionList({ userId } as any).catch(() => ({ data: [] }));
        const list: any[] = Array.isArray(sessions?.data) ? sessions.data : Array.isArray(sessions) ? sessions : [];
        for (const s of list) {
          const sid = s?.id || s?.sessionId;
          if (sid) await client.sessions.revokeSession(sid).catch(() => {});
        }
      } catch {}
    }
  } catch {}
  const url = new URL('/', request.url);
  const res = NextResponse.redirect(url, 303);
  res.cookies.delete('bypass_role');
  res.cookies.set('bypass_role', '', { path: '/', maxAge: 0 });
  // Let Clerk's Set-Cookie clear __session as well; also proactively expire known cookies
  res.cookies.delete('__session');
  res.cookies.delete('__client_uat');
  res.cookies.set('__session', '', { path: '/', maxAge: 0 });
  res.cookies.set('__client_uat', '', { path: '/', maxAge: 0 });
  return res;
}

export async function POST(request: Request) {
  return GET(request);
}
