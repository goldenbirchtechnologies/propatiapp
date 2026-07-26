import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import DisputeDetailClient from './DisputeDetailClient';

export default async function DisputeDetailPage({ params }: { params: { id: string } }) {
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
  if (user.role !== 'admin') redirect(rolePaths[user!.role] ?? '/dashboard/tenant');

  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        raisedByUser: {
          select: { id: true, fullName: true, email: true },
        },
        admin: {
          select: { id: true, fullName: true },
        },
        listing: {
          select: { id: true, title: true, address: true },
        },
        lawFirmCase: {
          select: { id: true, status: true },
        },
        evidencePack: {
          select: { id: true, status: true },
        },
      },
    });

    if (!dispute) {
      redirect('/admin/disputes');
    }

    return (
      <DashboardShell
        navigation={ADMIN_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <DisputeDetailClient
          dispute={{
            ...dispute,
            createdAt: dispute.createdAt,
            resolvedAt: dispute.resolvedAt,
          }}
        />
      </DashboardShell>
    );
  } catch (error) {
    return (
      <DashboardShell
        navigation={ADMIN_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <DisputeDetailClient
          dispute={{
            id: params.id,
            listingId: null,
            raisedBy: '',
            type: 'unknown',
            status: 'open',
            description: '',
            resolution: null,
            adminId: null,
            createdAt: new Date(),
            resolvedAt: null,
            raisedByUser: null,
            admin: null,
            listing: null,
            lawFirmCase: null,
            evidencePack: null,
          }}
          initialError={error instanceof Error ? error.message : 'Failed to load dispute details'}
        />
      </DashboardShell>
    );
  }
}
