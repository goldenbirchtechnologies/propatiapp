import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantAgreementDetailClient from './TenantAgreementDetailClient';

export default async function TenantAgreementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  const { id } = await params;

  let agreement: any = null;
  try {
    agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        listing: { include: { images: true } },
        landlord: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        agent: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        signatures: { select: { id: true, role: true, signedAt: true, consentText: true, checksum: true } },
        transactions: { select: { id: true, type: true, amount: true, status: true, createdAt: true } },
        rentSchedule: true,
        stampDuty: true,
      },
    });
  } catch (e) {
    console.error('[tenant/agreements/[id]] load failed', e);
    redirect('/dashboard/tenant/agreements');
  }

  if (!agreement || agreement.tenantId !== user.id) redirect('/dashboard/tenant/agreements');

  const serialized = {
    id: agreement.id,
    type: agreement.type,
    status: agreement.status,
    rentAmount: agreement.rentAmount ? Number(agreement.rentAmount) : 0,
    cautionDeposit: agreement.cautionDeposit ? Number(agreement.cautionDeposit) : 0,
    serviceCharge: agreement.serviceCharge ? Number(agreement.serviceCharge) : 0,
    rentPeriod: agreement.rentPeriod,
    startDate: agreement.startDate?.toISOString() ?? null,
    endDate: agreement.endDate?.toISOString() ?? null,
    specialClauses: agreement.specialClauses,
    jurisdictionState: agreement.jurisdictionState,
    governingStatute: agreement.governingStatute,
    landlordSignedAt: agreement.landlordSignedAt?.toISOString() ?? null,
    tenantSignedAt: agreement.tenantSignedAt?.toISOString() ?? null,
    pdfUrl: agreement.pdfUrl,
    pdfContentHash: agreement.pdfContentHash ?? null,
    lockStatus: agreement.lockStatus ?? 'mutable',
    integrityChainHash: agreement.integrityChainHash ?? null,
    listing: agreement.listing
      ? {
          id: agreement.listing.id,
          title: agreement.listing.title,
          address: agreement.listing.address,
          area: agreement.listing.area,
          state: agreement.listing.state,
          description: agreement.listing.description || '',
          price: Number(agreement.listing.price),
          images: (agreement.listing.images || []).map((img: { url: string; isCover: boolean }) => ({ url: img.url, isCover: img.isCover })),
        }
      : null,
    landlord: agreement.landlord ? { id: agreement.landlord.id, fullName: agreement.landlord.fullName, email: agreement.landlord.email, phone: agreement.landlord.phone, avatarUrl: agreement.landlord.avatarUrl } : null,
    tenant: agreement.tenant ? { id: agreement.tenant.id, fullName: agreement.tenant.fullName, email: agreement.tenant.email, phone: agreement.tenant.phone, avatarUrl: agreement.tenant.avatarUrl } : null,
    agent: agreement.agent ? { id: agreement.agent.id, fullName: agreement.agent.fullName, email: agreement.agent.email, phone: agreement.agent.phone, avatarUrl: agreement.agent.avatarUrl } : null,
    signatures: (agreement.signatures || []).map((s: { id: string; role: string; signedAt: Date; consentText: string | null; checksum: string | null }) => ({
      id: s.id,
      role: s.role,
      signedAt: s.signedAt.toISOString(),
      consentText: s.consentText,
      checksum: s.checksum,
    })),
    transactions: (agreement.transactions || []).map((t: { id: string; type: string; amount: bigint | number; status: string; createdAt: Date }) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount) / 100,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    rentSchedule: (agreement.rentSchedule || []).map((r: { id: string; dueDate: string; amount: any; status: string }) => ({
      id: r.id,
      dueDate: r.dueDate,
      amount: Number(r.amount),
      status: r.status,
    })),
    stampDuty: agreement.stampDuty ? { amount: Number(agreement.stampDuty.amount), status: agreement.stampDuty.status, certificateNumber: agreement.stampDuty.certificateNumber, remitaRrr: agreement.stampDuty.remitaRrr } : null,
  };

  return (
    <DashboardShell navigation={TENANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <TenantAgreementDetailClient agreement={serialized} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
