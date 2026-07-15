import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import VerificationDetailClient from './VerificationDetailClient';

export default async function AdminVerificationDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
    realtor: '/dashboard/agent',
  };
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect(rolePaths[user!.role] ?? '/dashboard/tenant');

  try {
    const verification = await prisma.verification.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        listingId: true,
        ownerId: true,
        currentLayer: true,
        overallStatus: true,
        l1Status: true,
        l2Status: true,
        l3Status: true,
        l4Status: true,
        l5Status: true,
        adminNotes: true,
        frozenReason: true,
        frozenAt: true,
        frozenBy: true,
        updatedAt: true,
        reviewedAt: true,
        listing: { select: { id: true, title: true, address: true, state: true, verificationTier: true } },
        owner: { select: { id: true, fullName: true, email: true, phone: true } },
        reviewer: { select: { id: true, fullName: true } },
        l4Agent: { select: { id: true, fullName: true } },
        documents: { select: { id: true, documentType: true, url: true, uploadedAt: true, fileName: true, mimeType: true } },
      },
    });

    if (!verification) redirect('/admin/verifications');

    return (
      <DashboardShell
        navigation={ADMIN_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <VerificationDetailClient
          verification={verification as unknown}
          initialError={'Failed to load verification details'}
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
        <VerificationDetailClient
          verification={{
            id: params.id,
            listingId: '',
            ownerId: '',
            currentLayer: 1,
            overallStatus: 'not_started',
            listing: null,
            owner: null,
            reviewer: null,
            l4Agent: null,
            documents: [],
            adminNotes: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            reviewedAt: null,
          }}
          initialError={error instanceof Error ? error.message : 'Failed to load verification details'}
        />
      </DashboardShell>
    );
  }
}
