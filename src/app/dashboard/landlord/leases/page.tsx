import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordLeasesClient from './LeasesClient';

export const metadata = {
  title: 'Leases – Landlord',
  description:
    'Overview of legal covenants, tenure expirations, stamp-duty verifications, and tenant payment liabilities across Lagos asset clusters.',
};

export default async function LandlordLeasesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const [agreements, units, invoices, stampDuties, transactions] = await Promise.all([
    prisma.agreement.findMany({
      where: { landlordId: user.id },
      include: {
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            idVerified: true,
            ninVerified: true,
            phoneVerified: true,
          },
        },
        listing: {
          select: { id: true, title: true, address: true, area: true, state: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.unit.findMany({
      where: { listing: { ownerId: user.id } },
      select: {
        listingId: true,
        buildingName: true,
        unitNumber: true,
        currentTenantId: true,
        occupancy: true,
      },
    }),
    prisma.invoice.findMany({
      where: { landlordId: user.id, agreementId: { not: null } },
      select: { agreementId: true, status: true },
      orderBy: { dueDate: 'desc' },
    }),
    prisma.stampDuty.findMany({
      where: { agreement: { landlordId: user.id } },
      select: { agreementId: true, status: true },
    }),
    prisma.transaction.findMany({
      where: { payeeId: user.id, type: 'caution', status: { in: ['in_escrow', 'pending'] } },
      select: { amount: true },
    }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ---- Stamp duty certification health (footer) ----
  const certifiedStatuses = ['paid', 'issued', 'processing'];
  const inProgressStatuses = ['pending', 'payment_pending'];
  const stampHealth = {
    certified: stampDuties.filter((s) => certifiedStatuses.includes(s.status)).length,
    inProgress: stampDuties.filter((s) => inProgressStatuses.includes(s.status)).length,
  };

  // ---- Escrow deposits held (footer) — Transaction.amount is kobo ----
  const escrowDeposits = transactions.reduce((sum, t) => sum + Number(t.amount) / 100, 0);

  // ---- Occupancy across the landlord's unit clusters ----
  const occupiedUnits = units.filter((u) => u.currentTenantId !== null || u.occupancy === 'OCCUPIED').length;
  const occupancy = {
    totalUnits: units.length,
    occupiedUnits,
    rate: units.length > 0 ? Math.round((occupiedUnits / units.length) * 1000) / 10 : 0,
  };

  // ---- Latest invoice per agreement (rent liability) ----
  const invoiceMap = new Map<string, string>();
  for (const inv of invoices) {
    if (inv.agreementId && !invoiceMap.has(inv.agreementId)) {
      invoiceMap.set(inv.agreementId, inv.status);
    }
  }

  // ---- Unit lookup per tenant ----
  const unitMap = new Map<string, (typeof units)[number]>();
  for (const u of units) {
    if (u.currentTenantId && !unitMap.has(u.currentTenantId)) {
      unitMap.set(u.currentTenantId, u);
    }
  }

  const stampByAgreement = new Map(stampDuties.map((s) => [s.agreementId, s.status]));

  const leases = agreements.map((agr) => {
    const unit = unitMap.get(agr.tenantId) || null;
    return {
      id: agr.id,
      property: agr.listing,
      tenant: {
        id: agr.tenant.id,
        fullName: agr.tenant.fullName,
        email: agr.tenant.email,
        phone: agr.tenant.phone,
        kycVerified: agr.tenant.idVerified || agr.tenant.ninVerified,
      },
      unit: unit ? { buildingName: unit.buildingName, unitNumber: unit.unitNumber } : null,
      status: agr.status,
      startDate: agr.startDate,
      endDate: agr.endDate,
      rentAmount: agr.rentAmount ? Number(agr.rentAmount) : null,
      rentPeriod: agr.rentPeriod,
      cautionDeposit: agr.cautionDeposit ? Number(agr.cautionDeposit) : null,
      noticePeriodDays: agr.noticePeriodDays,
      createdAt: agr.createdAt,
      latestInvoice: agr.id ? { status: invoiceMap.get(agr.id) ?? null } : { status: null },
      stampStatus: stampByAgreement.get(agr.id) ?? null,
    };
  });

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <LandlordLeasesClient
          leases={leases}
          stampHealth={stampHealth}
          escrowDeposits={escrowDeposits}
          occupancy={occupancy}
          monthStart={monthStart.toISOString()}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
