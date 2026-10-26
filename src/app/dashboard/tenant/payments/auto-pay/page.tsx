import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import AutoPayConfigurationClient from './AutoPayConfigurationClient';

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  const agreement = await prisma.agreement.findFirst({
    where: { tenantId: user.id, status: { not: 'draft' } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      rentAmount: true,
      rentPeriod: true,
      listing: { select: { title: true, address: true, area: true, state: true } },
    },
  });

  const mandate = agreement
    ? {
        title: agreement.listing.title,
        address: [agreement.listing.address, agreement.listing.area, agreement.listing.state].filter(Boolean).join(', '),
        reference: agreement.id,
        rentAmount: Number(agreement.rentAmount ?? 0),
        rentPeriod: agreement.rentPeriod,
      }
    : null;

  return (
    <TenantRailShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AutoPayConfigurationClient mandate={mandate} />
      </ErrorBoundary>
    </TenantRailShell>
  );
}
