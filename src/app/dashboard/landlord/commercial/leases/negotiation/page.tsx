import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Lease Negotiation – Landlord',
  description: 'Commercial lease negotiation workspace.',
};

export default async function CommercialLeaseNegotiationPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

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
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-foreground">Lease Negotiation Workspace</h1>
          <p className="text-muted-foreground mt-1">
            PROPATI Commercial — Finalize commercial lease terms with tenants and agents.
          </p>
        </section>

        {agreements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No agreements in negotiation.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {agreements.map((agr) => (
              <Card key={agr.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {agr.listing.title} — {agr.tenant.fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Rent:</span>{' '}
                    {agr.rentAmount ? `₦${Number(agr.rentAmount).toLocaleString()}` : 'Negotiable'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Term:</span>{' '}
                    {agr.startDate ? new Date(agr.startDate).toLocaleDateString() : '—'} →{' '}
                    {agr.endDate ? new Date(agr.endDate).toLocaleDateString() : '—'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Deposit:</span>{' '}
                    {agr.cautionDeposit ? `₦${Number(agr.cautionDeposit).toLocaleString()}` : '—'}
                  </p>
                  <Badge variant="secondary">{agr.status.replace('_', ' ')}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
