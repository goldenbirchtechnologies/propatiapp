import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/listings(.*)',
    '/api/webhooks(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/onboarding(.*)',
    '/api/health',
  ],
  ignoredRoutes: [
    '/api/webhooks(.*)',
  ],
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};