import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { UserRole } from '@prisma/client';

const VALID_ROLES: UserRole[] = ['landlord', 'tenant', 'agent', 'admin', 'estate_manager'];

export default async function DashboardRootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  let user: Awaited<ReturnType<typeof prisma.user.findUnique>> | null = null;
  try {
    user = await prisma.user.findUnique({ where: { clerkId: userId } });
  } catch (err) {
    console.error('DashboardRootPage: prisma.user.findUnique failed', err);
    throw err;
  }

  // Resolve the redirect target first, then redirect OUTSIDE any try/catch.
  // redirect() signals by throwing NEXT_REDIRECT; calling it inside a try means
  // a bare catch swallows the signal and re-throws from the catch block, which
  // Next.js surfaces as an opaque "error occurred in the Server Components
  // render" instead of navigating.
  let target: string | null = null;

  if (!user) {
    try {
      const clerkUser = await currentUser();

      if (clerkUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
        const fullName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email;
        const phone = clerkUser.phoneNumbers[0]?.phoneNumber ?? null;

        // Role comes from publicMetadata only. unsafeMetadata is writable by the
        // end user from the browser, so it must never decide authorization state.
        const claimedRole = clerkUser.publicMetadata?.role as UserRole | undefined;
        const role: UserRole =
          claimedRole && VALID_ROLES.includes(claimedRole) && claimedRole !== 'admin'
            ? claimedRole
            : 'tenant';

        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            fullName,
            phone,
            role,
            password: 'clerk_managed',
            isActive: true,
            isBanned: false,
          },
        });
      }
    } catch (error) {
      console.error('DashboardRootPage: failed to provision Prisma user', error);
    }
  }

  target = user ? getRoleRedirectPath(user.role) : '/sign-in';

  redirect(target);
}
