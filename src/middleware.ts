import { clerkMiddleware, createRouteMatcher, type ClerkMiddlewareOptions } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const isPublic = createRouteMatcher([
  '/',
  '/listings(.*)',
  '/api/listings(.*)',
  '/api/webhook(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/api/health',
]);

const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !['pk_test_your_key_here', 'pk_test_placeholder'].includes(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  process.env.CLERK_SECRET_KEY;

export async function middleware(req: NextRequest) {
  if (!isClerkConfigured) {
    if (isPublic(req as NextRequest)) return NextResponse.next();
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const options: ClerkMiddlewareOptions = {};
  const middleware = typeof clerkMiddleware === 'function' ? clerkMiddleware(options) : clerkMiddleware;
  return middleware(req);
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
