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
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_your_secret_here';

export default isClerkConfigured
  ? clerkMiddleware((auth, req) => {
      if (!isPublic(req)) {
        auth().protect();
      }
    })
  : (req: any) => {
      // Clerk not configured - allow all public routes, block protected routes
      if (isPublic(req)) {
        return NextResponse.next();
      }
      // Redirect protected routes to sign-in page
      return NextResponse.redirect(new URL('/sign-in', req.url));
    };

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};