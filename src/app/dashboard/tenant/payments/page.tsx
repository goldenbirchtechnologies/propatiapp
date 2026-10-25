import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import TenantPaymentsClient from './TenantPaymentsClient';

export default async function TenantPaymentsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  let metrics: { totalPaid: number; pendingCount: number; failedCount: number; avgSettlement: number } = {
    totalPaid: 0,
    pendingCount: 0,
    failedCount: 0,
    avgSettlement: 0,
  };
  let ledger: any[] = [];
  let alertInvoice: any | null = null;

  try {
    const userId = user.id;

    const [totalAgg, pendingC, failedC, releasedC, ledgerRows, pendingInvoice] = await Promise.all([
      prisma.transaction
        .aggregate({ where: { payerId: userId, status: 'released' }, _sum: { amount: true } })
        .catch(() => ({ _sum: { amount: BigInt(0) } } as any)),
      prisma.transaction.count({ where: { payerId: userId, status: { in: ['pending', 'in_escrow', 'commission_held'] } } }).catch(() => 0),
      prisma.transaction.count({ where: { payerId: userId, status: { in: ['failed', 'refunded'] } } }).catch(() => 0),
      prisma.transaction.count({ where: { payerId: userId, status: 'released' } }).catch(() => 0),
      prisma.transaction
        .findMany({
          where: { payerId: userId },
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            listing: { select: { id: true, title: true, area: true, address: true, listingType: true } },
          },
        })
        .catch(() => [] as any[]),
      prisma.invoice
        .findFirst({
          where: { tenantId: userId, status: { in: ['sent' as any, 'pending' as any, 'overdue' as any] } },
          orderBy: { dueDate: 'asc' },
          include: { listing: { select: { title: true } } },
        })
        .catch(() => null),
    ]);

    const totalKobo = Number((totalAgg as any)?._sum?.amount ?? BigInt(0));
    const totalNaira = totalKobo / 100;
    const avgNaira = releasedC > 0 ? totalNaira / releasedC : 0;

    metrics = {
      totalPaid: totalNaira,
      pendingCount: pendingC ?? 0,
      failedCount: failedC ?? 0,
      avgSettlement: avgNaira,
    };

    ledger = (ledgerRows as any[]).map((tx: any) => ({
      id: tx.id,
      reference: tx.reference ?? tx.paystackRef ?? tx.id,
      listing: tx.listing ? { id: tx.listing.id, title: tx.listing.title, area: tx.listing.area, address: tx.listing.address, listingType: tx.listing.listingType } : null,
      type: tx.type,
      status: tx.status,
      amount: Number(tx.amount ?? BigInt(0)) / 100,
      currency: tx.currency ?? 'NGN',
      paystackData: tx.paystackData ?? null,
      createdAt: tx.createdAt?.toISOString() ?? null,
      paidAt: tx.paidAt?.toISOString() ?? null,
    }));

    if (pendingInvoice) {
      const p = pendingInvoice as any;
      const due = p.dueDate ? new Date(p.dueDate) : null;
      const daysUntilDue = due ? Math.ceil((due.getTime() - Date.now()) / 86_400_000) : null;
      const overdue = due ? due.getTime() < Date.now() : false;
      const imminent = daysUntilDue != null && daysUntilDue <= 7;
      if (overdue || imminent) {
        alertInvoice = {
          id: p.id,
          title: p.listing?.title ?? 'Rent Installment',
          amount: Number(p.amount ?? 0),
          currency: p.currency ?? 'NGN',
          dueDate: p.dueDate?.toISOString?.() ?? null,
          daysUntilDue,
          overdue,
        };
      }
    }
  } catch (e) {
    console.error('Tenant payments page load error:', e);
  }

  return (
    <TenantRailShell navigation={TENANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <TenantPaymentsClient userId={user.id} metrics={metrics} ledger={ledger} alertInvoice={alertInvoice} />
      </ErrorBoundary>
    </TenantRailShell>
  );
}
