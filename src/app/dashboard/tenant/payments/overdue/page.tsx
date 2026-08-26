'use client';

import { useUser } from '@clerk/nextjs';
import DashboardShell from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TenantOverduePaymentNoticePage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole="tenant"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Tenant'}
      userAvatar={user?.imageUrl}
    >
      <ErrorBoundary>
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-6 shadow-none">
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="rounded-full">Notice</Badge>
              <h1 className="text-2xl font-bold text-white">Overdue Payment Notice</h1>
            </div>
            <p className="text-zinc-500 mt-2">You have outstanding payment(s) linked to your current agreements.</p>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-card">
              <div className="px-6 py-5 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white text-sm font-medium text-zinc-500">Overdue balance</h3>
              </div>
              <div className="p-6">
                <p className="text-2xl font-bold text-red-500">₦0</p>
                <p className="text-xs text-zinc-500 mt-1">Pending verification</p>
              </div>
            </div>
            <div className="glass-card">
              <div className="px-6 py-5 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white text-sm font-medium text-zinc-500">Due date</h3>
              </div>
              <div className="p-6">
                <p className="text-2xl font-bold text-white">--</p>
                <p className="text-xs text-zinc-500 mt-1">No active overdue item</p>
              </div>
            </div>
            <div className="glass-card">
              <div className="px-6 py-5 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white text-sm font-medium text-zinc-500">Notice reference</h3>
              </div>
              <div className="p-6">
                <p className="text-2xl font-bold text-white">--</p>
                <p className="text-xs text-zinc-500 mt-1">Awaiting issuance</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="default">Request Payment Plan</Button>
            <Button variant="outline">Contact Support</Button>
          </div>

          <div className="glass-card">
            <div className="px-6 py-5 border-b border-white/[0.08]">
              <h3 className="text-lg font-semibold text-white">Next steps</h3>
            </div>
            <div className="p-6">
              <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-500">
                <li>Review your current agreements and outstanding invoices.</li>
                <li>Use Rent & Payments to make a partial or full payment.</li>
                <li>Contact your landlord or agent if you need a payment plan.</li>
              </ul>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
