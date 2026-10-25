import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantAgreementSignClient from './TenantAgreementSignClient';

export default async function TenantAgreementSignPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  const { id } = await params;

  let agreement: any = null;
  try {
    agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        listing: { include: { images: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
        tenant: { select: { id: true, fullName: true, email: true } },
        signatures: { select: { id: true, role: true, signedAt: true } },
        stampDuty: { select: { amount: true, status: true } },
      },
    });
  } catch (e) {
    console.error('[tenant/agreements/[id]/sign] load failed', e);
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
    pdfUrl: agreement.pdfUrl,
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
    landlord: agreement.landlord ? { id: agreement.landlord.id, fullName: agreement.landlord.fullName, email: agreement.landlord.email } : null,
    tenant: agreement.tenant ? { id: agreement.tenant.id, fullName: agreement.tenant.fullName, email: agreement.tenant.email } : null,
    signatures: (agreement.signatures || []).map((s: { id: string; role: string; signedAt: Date }) => ({ id: s.id, role: s.role, signedAt: s.signedAt.toISOString() })),
    stampDuty: agreement.stampDuty ? { amount: Number(agreement.stampDuty.amount), status: agreement.stampDuty.status } : null,
  };

  return (
    <TenantRailShell navigation={TENANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <TenantAgreementSignClient />
      </ErrorBoundary>
    </TenantRailShell>
  );
}
