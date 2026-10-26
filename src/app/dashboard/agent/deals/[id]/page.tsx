import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentDealDetailClient from './AgentDealDetailClient';
import { stageForStatus } from '../../_lib/agent-deal-format';
import type { DealRecord } from '../../_lib/agent-deal-types';

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v) || 0;
  if (v && typeof v === 'object' && 'toNumber' in (v as object)) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return 0;
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const { id } = await params;

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      status: true,
      rentAmount: true,
      rentPeriod: true,
      cautionDeposit: true,
      serviceCharge: true,
      startDate: true,
      endDate: true,
      noticePeriodDays: true,
      specialClauses: true,
      jurisdictionState: true,
      governingStatute: true,
      riskTier: true,
      headTenantVerified: true,
      landlordSignedAt: true,
      tenantSignedAt: true,
      finalizedAt: true,
      lockStatus: true,
      pdfUrl: true,
      createdAt: true,
      updatedAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          area: true,
          city: true,
          state: true,
          listingType: true,
          propertyType: true,
          price: true,
          verificationTier: true,
        },
      },
      landlord: { select: { id: true, fullName: true, email: true, phone: true } },
      tenant: { select: { id: true, fullName: true, email: true, phone: true } },
      agent: { select: { id: true, fullName: true, email: true, phone: true } },
      stampDuty: { select: { amount: true, status: true, certificateUrl: true } },
      signatures: {
        select: { id: true, role: true, signedAt: true, checksum: true },
        orderBy: { signedAt: 'asc' },
      },
    },
  });

  // Agents only see matters they are assigned to.
  if (!agreement || agreement.agentId !== user.id) {
    redirect('/dashboard/agent/deals');
  }

  const [coverImage] = await prisma.listingImage.findMany({
    where: { listingId: agreement.listingId },
    select: { url: true, isCover: true },
    orderBy: { isCover: 'desc' },
    take: 1,
  });

  const consideration =
    agreement.listing?.listingType === 'sale'
      ? toNumber(agreement.listing.price)
      : toNumber(agreement.rentAmount);

  const deal: DealRecord & { consideration: number } = {
    id: agreement.id,
    reference: agreement.id.toUpperCase(),
    type: agreement.type,
    status: agreement.status,
    stage: stageForStatus(agreement.status),
    property: agreement.listing
      ? {
          id: agreement.listing.id,
          title: agreement.listing.title,
          address: agreement.listing.address,
          area: agreement.listing.area,
          city: agreement.listing.city,
          state: agreement.listing.state,
          listingType: agreement.listing.listingType,
          propertyType: agreement.listing.propertyType,
          price: toNumber(agreement.listing.price),
          imageUrl: coverImage?.url ?? null,
          verificationTier: agreement.listing.verificationTier,
        }
      : null,
    landlord: agreement.landlord,
    tenant: agreement.tenant,
    agent: agreement.agent,
    rentAmount: toNumber(agreement.rentAmount),
    rentPeriod: agreement.rentPeriod,
    cautionDeposit: toNumber(agreement.cautionDeposit),
    serviceCharge: toNumber(agreement.serviceCharge),
    startDate: agreement.startDate?.toISOString() ?? null,
    endDate: agreement.endDate?.toISOString() ?? null,
    noticePeriodDays: agreement.noticePeriodDays,
    specialClauses: agreement.specialClauses,
    jurisdictionState: agreement.jurisdictionState,
    governingStatute: agreement.governingStatute,
    riskTier: agreement.riskTier,
    headTenantVerified: agreement.headTenantVerified,
    landlordSignedAt: agreement.landlordSignedAt?.toISOString() ?? null,
    tenantSignedAt: agreement.tenantSignedAt?.toISOString() ?? null,
    finalizedAt: agreement.finalizedAt?.toISOString() ?? null,
    lockStatus: agreement.lockStatus,
    pdfUrl: agreement.pdfUrl,
    stampDutyAmount: agreement.stampDuty ? toNumber(agreement.stampDuty.amount) : null,
    stampDutyStatus: agreement.stampDuty?.status ?? null,
    stampDutyCertificateUrl: agreement.stampDuty?.certificateUrl ?? null,
    createdAt: agreement.createdAt.toISOString(),
    updatedAt: agreement.updatedAt.toISOString(),
    consideration,
  };

  const signatures = agreement.signatures.map((s) => ({
    id: s.id,
    role: s.role,
    signedAt: s.signedAt?.toISOString() ?? null,
    checksum: s.checksum,
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentDealDetailClient deal={deal} signatures={signatures} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
