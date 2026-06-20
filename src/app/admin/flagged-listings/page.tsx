import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import FlaggedListingsClient from './FlaggedListingsClient';

export default async function FlaggedListingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
  };
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(rolePaths[user.role]);

  // Fetch flagged listings
  const flaggedListings = await prisma.listing.findMany({
    where: {
      flags: {
        some: {},
      },
    },
    include: {
      flags: {
        include: {
          flagger: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <FlaggedListingsClient flaggedListings={flaggedListings} />
    </DashboardShell>
  );
}
