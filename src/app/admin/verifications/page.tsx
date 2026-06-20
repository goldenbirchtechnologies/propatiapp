import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import VerificationsClient from './VerificationsClient';

export default async function AdminVerificationsPage() {
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
  const roleRedirect = (u: typeof user) =>
    rolePaths[u.role] ?? '/dashboard/tenant';
  if (!user || user.role !== 'admin') redirect(roleRedirect(user));

  // Fetch all verifications with listing and owner data
  const verifications = await prisma.verification.findMany({
    where: {
      overallStatus: { in: ['in_progress', 'pending_review'] },
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
          propertyType: true,
          price: true,
        },
      },
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      documents: {
        select: {
          id: true,
          documentType: true,
          fileUrl: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <VerificationsClient verifications={verifications} />
    </DashboardShell>
  );
}
