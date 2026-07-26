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
  if (!isClerkConfigured) {
    if (isPublic(req)) return NextResponse.next();
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  let response: Response;
  try {
    const maybeResponse = await (clerkMiddleware as any)(req, event);
    response = (maybeResponse ?? new NextResponse()) as Response;
  } catch (error) {
    console.error('Clerk middleware failed:', error);
    return new NextResponse(null, { status: 500 });
  }

  if ((req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/verification')) && response.status === 200) {
    response.headers.set('Cache-Control', 'no-store');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
