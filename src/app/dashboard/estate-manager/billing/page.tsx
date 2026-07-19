import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import EstateManagerBillingClient from './EstateManagerBillingClient';

export default async function EstateManagerBillingPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'estate_manager') {
    redirect('/dashboard');
  }

  const agreements = await prisma.agreement.findMany({
    include: {
      listing: { select: { id: true, title: true } },
      tenant: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const bills = agreements
    .filter((a) => a.rentAmount)
    .map((a) => ({
      id: a.id,
      title: `${a.type} - ${a.listing?.title || 'Property'}`,
      tenant: a.tenant?.fullName || '—',
      amount: Number(a.rentAmount),
      dueDate: a.endDate || a.createdAt,
      status: a.status === 'fully_signed' ? 'paid' : 'pending',
    }));

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <EstateManagerBillingClient initialBills={bills as unknown} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
