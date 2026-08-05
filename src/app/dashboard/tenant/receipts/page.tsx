import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import TenantReceiptsClient from './TenantReceiptsClient';

export default async function TenantReceiptsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  const transactions = await prisma.transaction.findMany({
    where: { payerId: user.id, status: 'released' },
    include: {
      listing: { select: { id: true, title: true } },
      agreements: { select: { id: true, type: true } },
    },
    orderBy: { paidAt: 'desc' },
    take: 100,
  });

  const receipts = transactions.map((t) => ({
    id: t.id,
    ref: t.reference || t.paystackRef || t.id,
    amount: Number(t.amount),
    title: `${t.type} — ${t.listing?.title || 'Propati'}`,
    date: t.paidAt?.toISOString() || t.createdAt.toISOString(),
    status: t.status,
    method: t.paystackRef ? 'Paystack' : 'Propati',
  }));

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantReceiptsClient initialReceipts={receipts} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
