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
          <h1 className="text-3xl font-bold text-on-surface dark:text-white">Portfolio Analytics</h1>
          <p className="text-on-surface-variant dark:text-surface-variant dark:text-surface-variant mt-1">Overview of your owned properties and asset performance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-surface-variant dark:border-on-surface/10 p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-on-surface-variant dark:text-surface-variant dark:text-surface-variant">Total Portfolio Value</p>
            <p className="text-2xl font-bold mt-2">₦{(totalValue / 1e6).toFixed(1)}M</p>
          </div>
          <div className="rounded-xl border border-surface-variant dark:border-on-surface/10 p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-on-surface-variant dark:text-surface-variant dark:text-surface-variant">Active Listings</p>
            <p className="text-2xl font-bold mt-2">{listings.length}</p>
          </div>
          <div className="rounded-xl border border-surface-variant dark:border-on-surface/10 p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-on-surface-variant dark:text-surface-variant dark:text-surface-variant">Avg. Listing Value</p>
            <p className="text-2xl font-bold mt-2">
              {listings.length > 0 ? `₦${((totalValue / listings.length) / 1e6).toFixed(1)}M` : '—'}
            </p>
          </div>
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-surface-variant dark:border-on-surface/10">
            <h3 className="text-lg font-semibold text-on-surface dark:text-white">Properties</h3>
          </div>
          <div className="p-6">
            {listings.length === 0 ? (
              <p className="text-sm text-on-surface-variant dark:text-surface-variant dark:text-surface-variant py-6 text-center">No active listings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-800 border-b border-surface-variant dark:border-on-surface/10">
                    <tr>
                      <th className="px-5 py-4 text-sm font-medium text-on-surface-variant dark:text-surface-variant dark:text-surface-variant">Property</th>
                      <th className="px-5 py-4 text-sm font-medium text-on-surface-variant dark:text-surface-variant dark:text-surface-variant">Type</th>
                      <th className="px-5 py-4 text-sm font-medium text-on-surface-variant dark:text-surface-variant dark:text-surface-variant">Location</th>
                      <th className="px-5 py-4 text-sm font-medium text-on-surface-variant dark:text-surface-variant dark:text-surface-variant">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-surface-container-lowest dark:bg-zinc-900 transition-colors">
                        <td className="px-5 py-4 font-medium">{l.title}</td>
                        <td className="px-5 py-4 text-sm text-on-surface-variant dark:text-surface-variant dark:text-surface-variant capitalize">{l.listingType.replace('_', ' ')}</td>
                        <td className="px-5 py-4 text-sm">{l.area}</td>
                        <td className="px-5 py-4 text-sm font-medium">₦{new Intl.NumberFormat('en-NG').format(Number(l.price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}