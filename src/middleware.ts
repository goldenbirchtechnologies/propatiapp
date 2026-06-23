import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublic = createRouteMatcher([
  '/',
  '/listings(.*)',
  '/api/listings(.*)', // Public API for browsing listings
  '/api/webhook(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/api/health',
]);

// Check if Clerk is properly configured
const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here' &&
  process.env.CLERK_SECRET_KEY;

// At runtime this will throw if the key is missing or the
// placeholder string above is still in the .env; hault early
// so the failure is loud and obvious.
export default isClerkConfigured
  ? clerkMiddleware((auth, req) => {
      if (!isPublic(req)) {
        auth().protect();
        return undefined;
      }
      return undefined;
    })
  : new Proxy(
      {},
      {
        get: () => {
          throw new Error(
            'Clerk is not configured: set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY',
          );
        },
      },
    );

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};