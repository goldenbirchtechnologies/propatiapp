import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Commercial Leases Review – Landlord',
  description: 'Review proposed commercial lease terms.',
};

export default async function CommercialAgreementsReviewPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

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
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-foreground">Commercial Lease Agreement Review</h1>
          <p className="text-muted-foreground mt-1">
            Gold Verified Agent workspace — review proposed commercial terms.
          </p>
        </section>

        {agreements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No agreements currently pending review.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {agreements.map((agr) => (
              <Card key={agr.id}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {agr.listing.title} — {agr.listing.address}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Tenant:</span> {agr.tenant.fullName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Rent:</span>{' '}
                    {agr.rentAmount ? `₦${Number(agr.rentAmount).toLocaleString()}` : 'Negotiable'}
                    {agr.rentPeriod ? `/${agr.rentPeriod}` : ''}
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
                  <p>
                    <span className="text-muted-foreground">Service Charge:</span>{' '}
                    {agr.serviceCharge ? `₦${Number(agr.serviceCharge).toLocaleString()}/yr` : '—'}
                  </p>
                  <div>
                    <Badge variant={agr.status === 'draft' ? 'secondary' : 'outline'}>
                      {agr.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
