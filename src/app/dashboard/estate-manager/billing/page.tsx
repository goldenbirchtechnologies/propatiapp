import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import EstateManagerInvoicesClient from './EstateManagerInvoicesClient';

export default async function EstateManagerBillingPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'estate_manager') redirect('/dashboard');

  // Invoices issued against listings the manager's org(s) own.
  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id, status: 'active' },
    select: { orgId: true },
  });
  const orgIds = memberships.map((m) => m.orgId);

  const orgListings =
    orgIds.length > 0
      ? await prisma.orgListing.findMany({ where: { orgId: { in: orgIds } }, select: { listingId: true } })
      : [];
  const listingIds = orgListings.map((l) => l.listingId);

  const invoices =
    listingIds.length > 0
      ? await prisma.invoice.findMany({
          where: { listingId: { in: listingIds } },
          include: {
            listing: { select: { id: true, title: true, address: true } },
            tenant: { select: { id: true, fullName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 300,
        })
      : [];

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <EstateManagerInvoicesClient initialInvoices={invoices} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
