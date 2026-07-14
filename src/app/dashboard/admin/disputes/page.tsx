import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import Link from 'next/link';

export default async function AdminDisputesPage() {
  const disputes = await prisma.transaction.findMany({
    where: { confirmationStatus: 'disputed' },
    include: { listing: { select: { title: true } }, payer: { select: { fullName: true } }, payee: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Disputes</h1>
        <p className="text-muted-foreground">Resolve transaction disputes.</p>
        {disputes.length === 0 ? (
          <p>No open disputes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Transaction</th>
                  <th className="text-left p-3">Buyer</th>
                  <th className="text-left p-3">Seller</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((tx) => (
                  <tr key={tx.id} className="border-b">
                    <td className="p-3">{tx.listing?.title ?? tx.id}</td>
                    <td className="p-3">{tx.payer?.fullName ?? '—'}</td>
                    <td className="p-3">{tx.payee?.fullName ?? '—'}</td>
                    <td className="p-3">{new Date(tx.createdAt).toLocaleString('en-NG')}</td>
                    <td className="p-3 text-right">
                      <Link href={`/dashboard/admin/disputes/${tx.id}`} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
