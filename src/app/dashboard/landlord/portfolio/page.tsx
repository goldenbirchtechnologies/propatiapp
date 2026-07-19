import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Portfolio – Landlord',
  description: 'Overview of your owned properties and asset performance.',
};

export default async function LandlordPortfolioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id, status: 'active' },
    select: { id: true, title: true, price: true, listingType: true, area: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalValue = listings.reduce((sum, l) => sum + Number(l.price), 0);

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio Analytics</h1>
          <p className="text-muted-foreground mt-1">Overview of your owned properties and asset performance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-outline-variant p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <p className="text-2xl font-bold mt-2">₦{(totalValue / 1e6).toFixed(1)}M</p>
          </div>
          <div className="rounded-xl border border-outline-variant p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Active Listings</p>
            <p className="text-2xl font-bold mt-2">{listings.length}</p>
          </div>
          <div className="rounded-xl border border-outline-variant p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Avg. Listing Value</p>
            <p className="text-2xl font-bold mt-2">
              {listings.length > 0 ? `₦${((totalValue / listings.length) / 1e6).toFixed(1)}M` : '—'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No active listings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high border-b border-outline-variant">
                    <tr>
                      <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Property</th>
                      <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-5 py-4 font-medium">{l.title}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground capitalize">{l.listingType.replace('_', ' ')}</td>
                        <td className="px-5 py-4 text-sm">{l.area}</td>
                        <td className="px-5 py-4 text-sm font-medium">₦{new Intl.NumberFormat('en-NG').format(Number(l.price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
