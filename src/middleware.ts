import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';

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

  if (!isClerkConfigured) {
    if (isPublic(req)) return NextResponse.next();
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
