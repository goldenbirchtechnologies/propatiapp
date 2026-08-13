import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import TenantAgreementDetailClient from '../TenantAgreementDetailClient';

export default async function TenantAgreementSignPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  const { id } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/agreements/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    redirect('/dashboard/tenant/agreements');
  }
  const json = await res.json();
  const agreement = json.data;

  const serialized = {
    id: agreement.id,
    type: agreement.type,
    status: agreement.status,
    rentAmount: Number(agreement.rentAmount ?? 0),
    rentPeriod: agreement.rentPeriod,
    startDate: agreement.startDate?.toISOString() ?? null,
    endDate: agreement.endDate?.toISOString() ?? null,
    specialClauses: agreement.specialClauses,
    jurisdictionState: agreement.jurisdictionState,
    governingStatute: agreement.governingStatute,
    landlordSignedAt: agreement.landlordSignedAt?.toISOString() ?? null,
    tenantSignedAt: agreement.tenantSignedAt?.toISOString() ?? null,
    pdfUrl: agreement.pdfUrl,
    listing: agreement.listing
      ? {
          id: agreement.listing.id,
          title: agreement.listing.title,
          address: agreement.listing.address,
          area: agreement.listing.area,
          state: agreement.listing.state,
          price: Number(agreement.listing.price) / 100,
          description: agreement.listing.description || '',
          images: (agreement.listing.images || []).map((img: { url: string; isCover: boolean }) => ({
            url: img.url,
            isCover: img.isCover,
          })),
        }
      : null,
    landlord: agreement.landlord
      ? {
          id: agreement.landlord.id,
          fullName: agreement.landlord.fullName,
          email: agreement.landlord.email,
          phone: agreement.landlord.phone,
        }
      : null,
    tenant: agreement.tenant
      ? {
          id: agreement.tenant.id,
          fullName: agreement.tenant.fullName,
          email: agreement.tenant.email,
          phone: agreement.tenant.phone,
        }
      : null,
    agent: agreement.agent
      ? {
          id: agreement.agent.id,
          fullName: agreement.agent.fullName,
          email: agreement.agent.email,
          phone: agreement.agent.phone,
        }
      : null,
    signatures: (agreement.signatures || []).map((sig: { id: string; role: string; signedAt: Date; consentText: string | null }) => ({
      id: sig.id,
      role: sig.role,
      signedAt: sig.signedAt.toISOString(),
      consentText: sig.consentText,
    })),
    transactions: (agreement.transactions || []).map(
      (tx: { id: string; type: string; amount: number; status: string; createdAt: Date }) => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount) / 100,
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
      })
    ),
  };

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <TenantAgreementDetailClient agreement={serialized} />
    </DashboardShell>
  );
}
