import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TenantAgreementsClient, { type Agreement as ApplicationAgreement } from './TenantAgreementsClient';

export default async function TenantAgreementsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  let agreementsError: string | null = null;
  let agreements: ApplicationAgreement[] = [];

  try {
    agreements = (await prisma.agreement.findMany({
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
    })) as ApplicationAgreement[];
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
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white">Agreements</h3>
          </div>
          <div className="p-6">
            <p className="text-zinc-400">{agreementsError}</p>
            <Link
              href="/dashboard/tenant/agreements"
              className="mt-4 inline-block underline text-sm"
            >
              Retry
            </Link>
          </div>
        </div>
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
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
