import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import TenantAgreementsClient from './TenantAgreementsClient';

export default async function TenantAgreementsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  const agreements = await prisma.agreement.findMany({
    where: { tenantId: user.id },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          area: true,
          state: true,
          images: { where: { isCover: true }, take: 1 },
        },
      },
      landlord: { select: { id: true, fullName: true } },
      agent: { select: { id: true, fullName: true } },
      signatures: { include: { signer: { select: { id: true, fullName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <TenantAgreementsClient initialAgreements={agreements} />
    </DashboardShell>
  );
}
