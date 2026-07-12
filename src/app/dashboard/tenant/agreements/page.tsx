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
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  // ─── Pre-fetch agreements on the server ─────────────────────────────────────
  let agreements;
  try {
    agreements = await prisma.agreement.findMany({
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
  } catch {
    agreements = [];
  }

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <TenantAgreementsClient
        initialAgreements={agreements}
        onRetry={() => {
          // Retry forces a soft re-render (client re-fetches via polling / manual trigger)
          window.location.reload();
        }}
      />
    </DashboardShell>
  );
}
