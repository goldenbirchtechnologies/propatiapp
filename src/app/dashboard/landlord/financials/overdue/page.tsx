import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Overdue Payments – Landlord',
  description: 'Track and manage overdue rent and service charge payments.',
};

export default async function LandlordOverduePaymentsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const overdueRent = await prisma.rentSchedule.findMany({
    where: {
      agreement: { landlordId: user.id },
      status: 'overdue',
    },
    include: {
      agreement: {
        include: {
          tenant: { select: { fullName: true } },
          listing: { select: { title: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 50,
  });

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      agreement: { landlordId: user.id },
      status: 'overdue',
    },
    include: {
      agreement: {
        include: {
          tenant: { select: { fullName: true } },
          listing: { select: { title: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 50,
  });

  const rows = [
    ...overdueRent.map((r) => ({
      id: r.id,
      tenant: r.agreement.tenant.fullName,
      unit: r.agreement.listing.title,
      amount: Number(r.amount),
      days: Math.max(1, Math.floor((Date.now() - new Date(r.dueDate).getTime()) / 86400000)),
      noticeSent: r.reminderSent > 0,
      type: 'Rent' as const,
    })),
    ...overdueInvoices.map((inv) => ({
      id: inv.id,
      tenant: inv.agreement.tenant.fullName,
      unit: inv.agreement.listing.title,
      amount: Number(inv.totalAmount || inv.amount || 0),
      days: inv.dueDate ? Math.max(1, Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000)) : 0,
      noticeSent: inv.reminderSent || false,
      type: 'Invoice' as const,
    })),
  ];

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Overdue Payment Notices</h1>
          <p className="text-zinc-400 mt-1">Track and manage overdue rent and service charge payments.</p>
        </div>

        {rows.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-[#00ff66] font-medium">No overdue payments</p>
              <p className="text-sm text-zinc-400 mt-1">All rent schedules and invoices are up to date.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-[#262626] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#262626] flex justify-between items-center">
              <h3 className="font-heading font-bold">Overdue Accounts</h3>
              <span className="text-sm text-zinc-400">{rows.length} Accounts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-800 border-b border-[#262626]">
                  <tr>
                    <th className="px-5 py-4 text-sm font-medium text-zinc-400">Reference</th>
                    <th className="px-5 py-4 text-sm font-medium text-zinc-400">Type</th>
                    <th className="px-5 py-4 text-sm font-medium text-zinc-400">Tenant</th>
                    <th className="px-5 py-4 text-sm font-medium text-zinc-400">Unit</th>
                    <th className="px-5 py-4 text-sm font-medium text-zinc-400">Overdue Amount</th>
                    <th className="px-5 py-4 text-sm font-medium text-zinc-400">Days Overdue</th>
                    <th className="px-5 py-4 text-sm font-medium text-zinc-400">Notice Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-obsidian-800-lowest transition-colors">
                      <td className="px-5 py-4 text-sm font-mono text-zinc-400">{row.id}</td>
                      <td className="px-5 py-4 text-sm"><Badge variant="outline">{row.type}</Badge></td>
                      <td className="px-5 py-4 text-sm font-medium">{row.tenant}</td>
                      <td className="px-5 py-4 text-sm text-zinc-400">{row.unit}</td>
                      <td className="px-5 py-4 text-sm font-medium text-red-500">₦{row.amount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-red-500 font-bold">{row.days} days</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${row.noticeSent ? 'bg-success/10 text-[#00ff66] border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                          {row.noticeSent ? 'Sent' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
