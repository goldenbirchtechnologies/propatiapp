import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import TenantProfileClient from './TenantProfileClient';

export const metadata = {
  title: 'Tenant Profile – Landlord',
  description: 'Tenant overview, agreements, payments, maintenance, and KYC.',
};

interface TenantAgreement {
  id: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  rentAmount: number | null;
  cautionDeposit: number | null;
  serviceCharge: number | null;
  listing: { id: string; title: string; area: string; state: string } | null;
}

interface TenantUnit {
  id: string;
  buildingName: string | null;
  unitNumber: string;
  leaseStartDate: Date | null;
  leaseEndDate: Date | null;
}

interface TenantTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: Date;
  resolutionNote: string | null;
}

interface TenantKyc {
  id: string;
  status: string;
  level: number;
  dojahRef: string | null;
  verifiedAt: Date | null;
}

interface TenantProfileClientProps {
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    idVerified: boolean;
    ninVerified: boolean;
    phoneVerified: boolean;
    employmentStatus: string | null;
    employmentType: string | null;
    employerName: string | null;
    jobTitle: string | null;
    yearlyIncome: string | null;
    incomeVerified: boolean;
    profileBio: string | null;
    guarantorName: string | null;
    guarantorPhone: string | null;
    guarantorRelationship: string | null;
  };
  agreements: TenantAgreement[];
  invoices: {
    id: string;
    invoiceNumber: string;
    amount: number;
    type: string;
    status: string;
    dueDate: Date;
    createdAt: Date;
  }[];
  outstanding: number;
  kyc: TenantKyc | null;
  units: TenantUnit[];
  tickets: TenantTicket[];
}

export default async function LandlordTenantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const { id: tenantId } = await params;

  const tenant = await prisma.user.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      idVerified: true,
      ninVerified: true,
      phoneVerified: true,
      employmentStatus: true,
      employmentType: true,
      employerName: true,
      jobTitle: true,
      yearlyIncome: true,
      incomeVerified: true,
      profileBio: true,
      guarantorName: true,
      guarantorPhone: true,
      guarantorRelationship: true,
      userKyc: {
        select: { id: true, status: true, level: true, dojahRef: true, verifiedAt: true },
      },
      tenantAgreements: {
        where: { landlordId: user.id },
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          rentAmount: true,
          cautionDeposit: true,
          serviceCharge: true,
          listing: { select: { id: true, title: true, area: true, state: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      raisedTickets: {
        where: { listingId: { not: null } },
        select: { id: true, title: true, status: true, priority: true, category: true, createdAt: true, resolutionNote: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!tenant) redirect('/dashboard/landlord');

  const agreements: TenantAgreement[] = tenant.tenantAgreements.map((agr) => ({
    ...agr,
    rentAmount: agr.rentAmount ? Number(agr.rentAmount) : null,
    cautionDeposit: agr.cautionDeposit ? Number(agr.cautionDeposit) : null,
    serviceCharge: agr.serviceCharge ? Number(agr.serviceCharge) : null,
  }));

  const kyc = tenant.userKyc;

  const [units, rawInvoices] = await Promise.all([
    prisma.unit.findMany({
      where: { currentTenantId: tenantId },
      select: { id: true, buildingName: true, unitNumber: true, leaseStartDate: true, leaseEndDate: true },
    }),
    prisma.invoice.findMany({
      where: { landlordId: user.id, tenantId },
      select: { id: true, invoiceNumber: true, amount: true, type: true, status: true, dueDate: true, createdAt: true },
      orderBy: { dueDate: 'desc' },
      take: 20,
    }),
  ]);

  const invoices = rawInvoices.map((inv) => ({
    ...inv,
    amount: Number(inv.amount),
  }));

  if (!agreements.length && !units.length) {
    redirect('/dashboard/landlord');
  }

  const outstanding = invoices.reduce((sum, inv) => (inv.status === 'paid' ? sum : sum + inv.amount), 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantProfileClient
          tenant={{
            ...tenant,
            userKyc: undefined,
            tenantAgreements: undefined,
            raisedTickets: undefined,
            yearlyIncome: tenant.yearlyIncome ? String(tenant.yearlyIncome) : null,
          } as any}
          agreements={agreements}
          invoices={invoices}
          outstanding={outstanding}
          kyc={kyc}
          units={units}
          tickets={tenant.raisedTickets}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
