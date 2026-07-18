import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Commercial Leases – Landlord',
  description: 'Manage commercial lease agreements.',
};

export default async function CommercialLeasesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const agreements = await prisma.agreement.findMany({
    where: {
      landlordId: user.id,
      listing: { listingType: 'commercial' },
    },
    include: {
      tenant: { select: { fullName: true } },
      listing: { select: { title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commercial Lease Management</h1>
          <p className="text-muted-foreground mt-1">
            Verified Enterprise — Manage revenue, billing, and legal records for commercial properties.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Commercial Leases</CardTitle>
          </CardHeader>
          <CardContent>
            {agreements.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No commercial lease agreements yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="py-3 font-medium">Property</th>
                      <th className="py-3 font-medium">Tenant</th>
                      <th className="py-3 font-medium">Rent</th>
                      <th className="py-3 font-medium">Period</th>
                      <th className="py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agreements.map((agr) => (
                      <tr key={agr.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{agr.listing.title}</td>
                        <td className="py-3">{agr.tenant.fullName}</td>
                        <td className="py-3 font-mono">
                          {agr.rentAmount ? `₦${Number(agr.rentAmount).toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {agr.startDate ? new Date(agr.startDate).toLocaleDateString() : '—'} →{' '}
                          {agr.endDate ? new Date(agr.endDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3">
                          <Badge variant={agr.status === 'active' ? 'default' : 'secondary'}>
                            {agr.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
