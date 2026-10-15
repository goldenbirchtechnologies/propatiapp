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

  // Invoices are scoped by landlord, but an estate manager bills on behalf of
  // the properties they manage. Resolve the listing ids reachable through the
  // orgs this manager belongs to, then pull invoices for those listings.
  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id, status: 'active' },
    select: { orgId: true },
  });
  const orgIds = memberships.map((m) => m.orgId);

  const orgListings =
    orgIds.length > 0
      ? await prisma.orgListing.findMany({
          where: { orgId: { in: orgIds } },
          select: { listingId: true },
        })
      : [];
  const listingIds = orgListings.map((l) => l.listingId);

  const invoices =
    listingIds.length > 0
      ? await prisma.invoice.findMany({
          where: { listingId: { in: listingIds } },
          include: {
            listing: { select: { id: true, title: true, address: true } },
            tenant: { select: { id: true, fullName: true, email: true } },
            agreement: { select: { id: true, type: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 200,
        })
      : [];

  const bills = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    type: inv.type,
    amount: Number(inv.amount),
    status: inv.status,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    listing: inv.listing,
    tenant: inv.tenant,
    agreement: inv.agreement,
  }));

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <EstateManagerBillingClient initialBills={bills} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
