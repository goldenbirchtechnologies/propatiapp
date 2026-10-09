import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import {
  isAuthBypassEnabled,
  isValidBypassRole,
} from '@/lib/auth-bypass-config';

const isPublic = createRouteMatcher([
  '/',
  '/listings(.*)',
  '/api/listings(.*)',
  '/api/webhook(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/login(.*)',
  '/onboarding(.*)',
  '/api/health',
]);

const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !['pk_test_your_key_here', 'pk_test_placeholder'].includes(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  process.env.CLERK_SECRET_KEY;

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const reqUrl = req.nextUrl;

  // Redirect legacy /login to the actual sign-in route.
  if (reqUrl.pathname === '/login' || reqUrl.pathname.startsWith('/login/')) {
    const signIn = new URL('/sign-in', req.url);
    signIn.search = reqUrl.search;
    return NextResponse.redirect(signIn);
  }

  // Dev bypass (AUTH_BYPASS=*** /?as=<role> pins the bypass role via
  // cookie so role-gated dashboards (/dashboard/<role>) render on the
  // very first request. Note: clerkMiddleware still runs below in bypass
  // mode — pages that fall through to auth() need its context.
  if (isAuthBypassEnabled()) {
    const asRole = reqUrl.searchParams.get('as');
    const normalizedRole = asRole?.replace(/-/g, '_');
    if (isValidBypassRole(normalizedRole)) {
      const cleanUrl = reqUrl.clone();
      cleanUrl.searchParams.delete('as');
      const resp = NextResponse.redirect(cleanUrl);
      resp.cookies.set('bypass_role', normalizedRole, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
      return resp;
    }
    // Clerk may be configured (real test keys) while the dev bypass is on —
    // clerkMiddleware would still redirect signed-out users to /sign-in
    // ("dev-browser-missing"), which pre-empts the page-level bypass entirely.
    // Skip it: pages resolve the dev user via getCurrentUser /
    // resolveAuthUserId, both of which are bypass-aware.
    const resp = NextResponse.next();
    if (
      reqUrl.pathname.startsWith('/dashboard') ||
      reqUrl.pathname.startsWith('/admin') ||
      reqUrl.pathname.startsWith('/verification')
    ) {
      resp.headers.set('Cache-Control', 'no-store');
    }
    return resp;
  }

  if (!isClerkConfigured) {
    if (isPublic(req)) return NextResponse.next();
    if (isAuthBypassEnabled()) return NextResponse.next();
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  try {
    const maybeResponse = await (clerkMiddleware as any)(req, event);
    const response = (maybeResponse ?? new Response(null, { status: 200 })) as Response;

    if (
      (reqUrl.pathname.startsWith('/dashboard') || reqUrl.pathname.startsWith('/admin') || reqUrl.pathname.startsWith('/verification')) &&
      response.status === 200
    ) {
      response.headers.set('Cache-Control', 'no-store');
    }

    return response;
  } catch (error) {
    console.error('Clerk middleware failed:', error);
    if (isPublic(req)) {
      return NextResponse.next();
    }
    if (isAuthBypassEnabled()) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
