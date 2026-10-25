import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import TenantOverdueClient from './TenantOverdueClient';

export default async function TenantOverduePage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  let invoices: any[] = [];
  try {
    invoices = await prisma.invoice.findMany({
      where: { tenantId: user.id, status: 'overdue' },
      orderBy: { dueDate: 'asc' },
      include: { listing: { select: { id: true, title: true, address: true } } },
    });
  } catch (e) {
    console.error('overdue load error', e);
  }

  const rows = invoices.map((inv: any) => ({
    id: inv.id,
    title: inv.listing?.title ?? 'Rent Installment',
    amount: Number(inv.amount ?? 0),
    currency: inv.currency ?? 'NGN',
    dueDate: inv.dueDate?.toISOString?.() ?? null,
    status: inv.status,
    reference: inv.id,
  }));

  const totalOverdue = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <TenantRailShell navigation={TENANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <TenantOverdueClient rows={rows} totalOverdue={totalOverdue} />
      </ErrorBoundary>
    </TenantRailShell>
  );
}