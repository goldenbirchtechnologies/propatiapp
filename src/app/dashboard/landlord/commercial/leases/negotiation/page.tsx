import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Lease Negotiation – Landlord',
  description: 'Commercial lease negotiation workspace.',
};

export default async function CommercialLeaseNegotiationPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const agreements = await prisma.agreement.findMany({
    where: {
      landlordId: user.id,
      status: { in: ['review_required', 'pending_signature'] },
    },
    include: {
      tenant: { select: { fullName: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-white">Lease Negotiation Workspace</h1>
          <p className="text-zinc-500 mt-1">
            PROPATI Commercial — Finalize commercial lease terms with tenants and agents.
          </p>
        </section>

        {agreements.length === 0 ? (
          <div className="glass-card">
            <div className="p-6 p-8 text-center">
              <p className="text-zinc-500">No agreements in negotiation.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {agreements.map((agr) => (
              <div className="glass-card" key={agr.id}>
                <div className="px-6 py-5 border-b border-white/[0.08]">
                  <h3 className="text-lg font-semibold text-white text-base">
                    {agr.listing.title} — {agr.tenant.fullName}
                  </h3>
                </div>
                <div className="p-6 space-y-2 text-sm">
                  <p>
                    <span className="text-zinc-500">Rent:</span>{' '}
                    {agr.rentAmount ? `₦${Number(agr.rentAmount).toLocaleString()}` : 'Negotiable'}
                  </p>
                  <p>
                    <span className="text-zinc-500">Term:</span>{' '}
                    {agr.startDate ? new Date(agr.startDate).toLocaleDateString() : '—'} →{' '}
                    {agr.endDate ? new Date(agr.endDate).toLocaleDateString() : '—'}
                  </p>
                  <p>
                    <span className="text-zinc-500">Deposit:</span>{' '}
                    {agr.cautionDeposit ? `₦${Number(agr.cautionDeposit).toLocaleString()}` : '—'}
                  </p>
                  <Badge variant="secondary">{agr.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
