import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantAgreementsClient from './TenantAgreementsClient';

export default async function TenantAgreementsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  let agreementsError: string | null = null;
  let agreements: any[] = [];

  try {
    const rows = await prisma.agreement.findMany({
      where: { tenantId: user.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            state: true,
            images: { where: { isCover: true }, take: 1, select: { url: true, isCover: true } },
          },
        },
        landlord: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        agent: { select: { id: true, fullName: true, email: true } },
        signatures: { select: { id: true, role: true, signedAt: true } },
        rentSchedule: { select: { id: true, dueDate: true, amount: true, status: true } },
        stampDuty: { select: { id: true, amount: true, status: true, certificateNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    agreements = rows.map((a) => ({
      id: a.id,
      type: a.type,
      status: a.status,
      startDate: a.startDate?.toISOString() ?? null,
      endDate: a.endDate?.toISOString() ?? null,
      rentAmount: a.rentAmount ? Number(a.rentAmount) : 0,
      cautionDeposit: a.cautionDeposit ? Number(a.cautionDeposit) : 0,
      serviceCharge: a.serviceCharge ? Number(a.serviceCharge) : 0,
      createdAt: a.createdAt.toISOString(),
      landlordSignedAt: a.landlordSignedAt?.toISOString() ?? null,
      tenantSignedAt: a.tenantSignedAt?.toISOString() ?? null,
      pdfUrl: a.pdfUrl,
      listing: a.listing
        ? {
            id: a.listing.id,
            title: a.listing.title,
            address: a.listing.address,
            area: a.listing.area,
            state: a.listing.state,
            images: (a.listing.images ?? []).map((img) => ({ url: img.url, isCover: img.isCover })),
          }
        : null,
      landlord: a.landlord ? { id: a.landlord.id, fullName: a.landlord.fullName, email: a.landlord.email, avatarUrl: a.landlord.avatarUrl } : null,
      agent: a.agent ? { id: a.agent.id, fullName: a.agent.fullName } : null,
      signatures: (a.signatures ?? []).map((s) => ({ id: s.id, role: s.role, signedAt: s.signedAt.toISOString() })),
      rentSchedule: (a.rentSchedule ?? []).map((r) => ({ id: r.id, dueDate: r.dueDate, amount: Number(r.amount), status: r.status })),
      stampDuty: a.stampDuty ? { amount: Number(a.stampDuty.amount), status: a.stampDuty.status, certificateNumber: a.stampDuty.certificateNumber } : null,
    }));
  } catch (e) {
    console.error('[tenant/agreements] load failed', e);
    agreementsError = 'Failed to load agreements';
  }

  if (agreementsError) {
    return (
      <TenantRailShell
        navigation={TENANT_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08]">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Agreements</h3>
          </div>
          <div className="p-6">
            <p className="text-zinc-600 dark:text-zinc-400">{agreementsError}</p>
            <Link href="/dashboard/tenant/agreements" className="mt-4 inline-block underline text-sm">
              Retry
            </Link>
          </div>
        </div>
      </TenantRailShell>
    );
  }

  return (
    <TenantRailShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantAgreementsClient />
      </ErrorBoundary>
    </TenantRailShell>
  );
}
