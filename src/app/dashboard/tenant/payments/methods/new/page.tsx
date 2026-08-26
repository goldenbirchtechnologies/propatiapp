'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerificationBadge } from '@/components/ui/badges';

export default function addpaymentmethodmodalpropatitenantportalPage() {
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
            <div>
              <h1 className="text-2xl font-bold text-white">Add Payment Method</h1>
              <p className="text-zinc-500 mt-1">
                Add a verified payment method to your tenant portal for secure transactions.
              </p>
            </div>
            <VerificationBadge tier="verified" />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card lg:col-span-2">
            <div className="px-6 py-5 border-b border-white/[0.08]">
              <h3 className="text-lg font-semibold text-white">Payment Method</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="save"
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="save" className="text-sm text-white">
                  Save this card for future payments
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="default">Add Payment Method</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card">
              <div className="px-6 py-5 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white">Design Reference</h3>
              </div>
              <div className="p-6">
                <Image
                  src="/modals/add_payment_method_modal.png"
                  alt="Add Payment Method Modal Reference"
                  width={480}
                  height={360}
                  className="rounded-lg border border-white/[0.08]"
                />
              </div>
            </div>
            <div className="glass-card">
              <div className="px-6 py-5 border-b border-white/[0.08]">
                <h3 className="text-lg font-semibold text-white">Saved Methods</h3>
              </div>
              <div className="p-6">
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-500">
                  <li>Secure Access</li>
                  <li>Visa **** 4242</li>
                  <li>Expires 12/25</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
