import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  let agreementsError: string | null = null;
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
    agreementsError = 'Failed to load agreements';
  }

  if (agreementsError) {
    return (
      <DashboardShell
        navigation={TENANT_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <Card>
          <CardHeader>
            <CardTitle>Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{agreementsError}</p>
            <button
              type="button"
              className="mt-4 underline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantAgreementsClient
          initialAgreements={agreements}
          onRetry={() => {
            // Retry forces a soft re-render (client re-fetches via polling / manual trigger)
            window.location.reload();
          }}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
