import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

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

const clerkMiddlewareHandler = clerkMiddleware();

export async function middleware(req: NextRequest) {
  if (!isClerkConfigured) {
    if (isPublic(req)) return NextResponse.next();
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return clerkMiddlewareHandler(req);
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
