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

  const [agreements, paystackAccount, existingMandate] = await Promise.all([
    prisma.agreement.findMany({
      where: { tenantId: user.id, status: 'fully_signed' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        rentAmount: true,
        rentPeriod: true,
        landlord: { select: { fullName: true, email: true } },
        listing: { select: { title: true, address: true, area: true, state: true } },
        rentSchedule: { orderBy: { dueDate: 'asc' }, take: 1, select: { dueDate: true, amount: true, status: true } },
      },
    }),
    prisma.userPaystackAccount.findUnique({
      where: { userId: user.id },
      select: { bankName: true, accountNumber: true, accountName: true, recipientCode: true, status: true },
    }),
    prisma.autoPayMandate.findFirst({
      where: { userId: user.id, status: { not: 'cancelled' } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, agreementId: true, enabled: true, execDay: true, amountStrategy: true, threshold: true, status: true, createdAt: true },
    }),
  ]);

  const tenancies = agreements.map((agreement) => ({
    id: agreement.id,
    title: agreement.listing.title,
    address: [agreement.listing.address, agreement.listing.area, agreement.listing.state].filter(Boolean).join(', '),
    landlordName: agreement.landlord.fullName || agreement.landlord.email,
    status: agreement.status,
    rentAmount: Number(agreement.rentAmount ?? 0),
    rentPeriod: agreement.rentPeriod,
    dueDate: agreement.rentSchedule[0]?.dueDate ?? null,
    ledgerAmount: agreement.rentSchedule[0]?.amount ? Number(agreement.rentSchedule[0].amount) : null,
    ledgerStatus: agreement.rentSchedule[0]?.status ?? null,
  }));

  return (
    <TenantRailShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AutoPayConfigurationClient tenancies={tenancies} bankAccount={paystackAccount} mandate={existingMandate ? {
          id: existingMandate.id,
          agreementId: existingMandate.agreementId,
          enabled: existingMandate.enabled,
          execDay: existingMandate.execDay,
          amountStrategy: existingMandate.amountStrategy,
          threshold: existingMandate.threshold ? Number(existingMandate.threshold) : null,
          status: existingMandate.status,
          createdAt: existingMandate.createdAt.toISOString(),
        } : null} />
      </ErrorBoundary>
    </TenantRailShell>
  );
}
