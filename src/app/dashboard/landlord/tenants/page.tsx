import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordTenantsClient from './LandlordTenantsClient';

export const metadata = {
  title: 'Tenants – Landlord',
  description: 'Directory of tenants, lease terms, rent status, and KYC badges.',
};

export default async function LandlordTenantsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const [agreements, units, invoices] = await Promise.all([
    prisma.agreement.findMany({
      where: { landlordId: user.id },
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            idVerified: true,
            ninVerified: true,
            phoneVerified: true,
          },
        },
        listing: {
          select: { id: true, title: true, area: true, state: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.unit.findMany({
      where: { listing: { ownerId: user.id }, currentTenantId: { not: null } },
      select: {
        currentTenantId: true,
        buildingName: true,
        unitNumber: true,
        leaseStartDate: true,
        leaseEndDate: true,
      },
    }),
    prisma.invoice.findMany({
      where: { landlordId: user.id, tenantId: { not: null } },
      select: { tenantId: true, status: true },
      orderBy: { dueDate: 'desc' },
      take: 300,
    }),
  ]);

  const unitMap = new Map(units.map((u) => [u.currentTenantId!, u]));
  const latestInvoiceMap = new Map<string, { status: string }>();
  for (const inv of invoices) {
    if (inv.tenantId && !latestInvoiceMap.has(inv.tenantId)) {
      latestInvoiceMap.set(inv.tenantId, { status: inv.status });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantMap = new Map<string, any>();
  for (const agr of agreements) {
    const key = agr.tenantId;
    const existing = tenantMap.get(key);
    const payload = {
      ...agr.tenant,
      agreementId: agr.id,
      agreementStatus: agr.status,
      startDate: agr.startDate,
      endDate: agr.endDate,
      rentAmount: agr.rentAmount ? Number(agr.rentAmount) : null,
      property: agr.listing,
      unit: unitMap.get(key) || existing?.unit || null,
      latestInvoice: latestInvoiceMap.get(key) || existing?.latestInvoice || null,
    };
    tenantMap.set(key, payload);
  }

  const tenants = Array.from(tenantMap.values());

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <LandlordTenantsClient tenants={tenants} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
