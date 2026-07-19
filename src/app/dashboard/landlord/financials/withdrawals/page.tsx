import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Withdrawals – Landlord',
  description: 'Manage your payouts and fund transfers.',
};

export default async function LandlordWithdrawalsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const payouts = await prisma.transaction.findMany({
    where: { payeeId: user.id, type: { in: ['withdrawal', 'payout'] } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Withdrawals &amp; Fund Management</h1>
            <p className="text-muted-foreground mt-1">Manage your payouts and fund transfers.</p>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant">
            <h3 className="font-heading font-bold">Recent Withdrawals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Reference</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No withdrawals yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((w) => (
                    <tr key={w.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-5 py-4 text-sm font-mono text-muted-foreground">{w.reference || w.id}</td>
                      <td className="px-5 py-4 text-sm">{new Date(w.createdAt).toLocaleDateString('en-NG')}</td>
                      <td className="px-5 py-4 text-sm"><span className="capitalize">{w.type.replace('_', ' ')}</span></td>
                      <td className="px-5 py-4 text-sm font-medium">₦{new Intl.NumberFormat('en-NG').format(Number(w.amount) / 100)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${w.status === 'released' ? 'bg-success/10 text-success border border-success/20' : w.status === 'pending' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-muted/30 text-muted-foreground'}`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
