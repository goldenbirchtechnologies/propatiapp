import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (userId) {
      try {
        const client = await clerkClient();
        await client.sessions.revokeSession(userId as any).catch(() => {});
      } catch {}
      try {
        const a: any = await auth();
        if (typeof a?.signOut === 'function') await a.signOut();
      } catch {}
    }
  } catch {}
  const url = new URL('/', request.url);
  const res = NextResponse.redirect(url, 303);
  res.cookies.delete('bypass_role');
  res.cookies.delete('__session');
  res.cookies.delete('__client_uat');
  return res;
}

export async function POST(request: Request) {
  return GET(request);
}
