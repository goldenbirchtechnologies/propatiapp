import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck2 } from 'lucide-react';

export const metadata = {
  title: 'Commercial Lease Agreement Review – Landlord',
  description: 'Review proposed commercial lease terms before signing.',
};

export default async function CommercialAgreementsReviewPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const agreements = await prisma.agreement.findMany({
    where: {
      landlordId: user.id,
      OR: [{ status: 'pending_signature' }, { status: 'review_required' }],
    },
    include: {
      tenant: { select: { fullName: true } },
      listing: { select: { title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="space-y-6">
          <section>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Commercial Lease Agreement Review</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Review proposed commercial lease terms before signing.
            </p>
          </section>

          {agreements.length === 0 ? (
            <div className="glass-card">
              <div className="p-8 text-center">
                <FileCheck2 className="mx-auto h-16 w-16 text-zinc-400 opacity-50" />
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">No agreements awaiting review.</p>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-white/[0.08] text-left uppercase font-medium text-zinc-600 dark:text-zinc-400">
                        <th className="py-3 pr-4">Property</th>
                        <th className="py-3 pr-4">Tenant</th>
                        <th className="py-3 pr-4">Lease Terms</th>
                        <th className="py-3 pr-4">Rent</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreements.map((agr) => (
                        <tr key={agr.id} className="border-b border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="py-3 pr-4">
                            <div className="font-medium text-zinc-900 dark:text-white">{agr.listing.title}</div>
                            <div className="text-xs text-zinc-500">{agr.listing.address}</div>
                          </td>
                          <td className="py-3 pr-4">{agr.tenant.fullName}</td>
                          <td className="py-3 pr-4">
                            {agr.startDate ? new Date(agr.startDate).toLocaleDateString('en-NG') : '—'} →{' '}
                            {agr.endDate ? new Date(agr.endDate).toLocaleDateString('en-NG') : '—'}
                          </td>
                          <td className="py-3 pr-4">
                            {agr.rentAmount ? `₦${Number(agr.rentAmount).toLocaleString()}` : 'Negotiable'}
                            {agr.rentPeriod ? `/${agr.rentPeriod}` : ''}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={agr.status === 'review_required' ? 'outline' : 'secondary'}>
                              {agr.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                                Sign Agreement
                              </button>
                              <button className="inline-flex items-center rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                                Request Changes
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}