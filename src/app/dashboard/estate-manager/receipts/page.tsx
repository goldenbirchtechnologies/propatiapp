import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import EstateManagerReceiptsClient from './EstateManagerReceiptsClient';

export default async function EstateManagerReceiptsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'estate_manager') redirect('/dashboard');

  // Receipts are the settled invoices the manager has raised against listings
  // they manage. Scope via org memberships → org listings → invoices.
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
            agreement: { select: { id: true, type: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 300,
        })
      : [];

  const receipts = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    type: inv.type,
    amount: Number(inv.amount),
    status: inv.status,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    pdfUrl: inv.pdfUrl,
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
        <EstateManagerReceiptsClient initialReceipts={receipts} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
