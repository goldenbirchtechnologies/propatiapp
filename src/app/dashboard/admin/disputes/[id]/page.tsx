import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import Link from 'next/link';

export default async function AdminDisputeDetailPage({ params }: { params: { id: string } }) {
  const tx = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: { listing: { select: { title: true, images: { where: { isCover: true }, take: 1 } } }, payer: { select: { fullName: true, email: true } }, payee: { select: { fullName: true, email: true } }, agent: { select: { fullName: true, email: true } } },
  });

  if (!tx || tx.confirmationStatus !== 'disputed') {
    return (
      <DashboardShell navigation={ADMIN_NAVIGATION}>

        <ErrorBoundary>

        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Dispute not found</h1>
          <Link href="/dashboard/admin/disputes" className="text-blue-600 underline">Back to disputes</Link>
        </div>
      
        </ErrorBoundary>
</DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dispute Review</h1>
            <p className="text-muted-foreground">{tx.listing?.title || 'Transaction'}</p>
          </div>
          <Link href="/dashboard/admin/disputes" className="ml-auto text-sm underline">Back</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Buyer</p>
            <p className="text-sm font-medium mt-1">{tx.payer?.fullName ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{tx.payer?.email ?? ''}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Seller</p>
            <p className="text-sm font-medium mt-1">{tx.payee?.fullName ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{tx.payee?.email ?? ''}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Agent</p>
            <p className="text-sm font-medium mt-1">{tx.agent?.fullName ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{tx.agent?.email ?? ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/api/admin/deal/${tx.id}/release-commission`} className="px-4 py-2 bg-success text-white rounded-lg">Force release commission</Link>
          <Link href={`/api/admin/deal/${tx.id}`} className="px-4 py-2 bg-destructive text-white rounded-lg">Cancel deal / refund</Link>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
