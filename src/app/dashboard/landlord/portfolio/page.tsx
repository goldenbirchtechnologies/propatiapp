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
          <h1 className="text-3xl font-bold text-white">Portfolio Analytics</h1>
          <p className="text-zinc-400 mt-1">Overview of your owned properties and asset performance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/[0.08] p-5 shadow-none">
            <p className="text-sm text-zinc-400">Total Portfolio Value</p>
            <p className="text-2xl font-bold mt-2">₦{(totalValue / 1e6).toFixed(1)}M</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] p-5 shadow-none">
            <p className="text-sm text-zinc-400">Active Listings</p>
            <p className="text-2xl font-bold mt-2">{listings.length}</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] p-5 shadow-none">
            <p className="text-sm text-zinc-400">Avg. Listing Value</p>
            <p className="text-2xl font-bold mt-2">
              {listings.length > 0 ? `₦${((totalValue / listings.length) / 1e6).toFixed(1)}M` : '—'}
            </p>
          </div>
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white">Properties</h3>
          </div>
          <div className="p-6">
            {listings.length === 0 ? (
              <p className="text-sm text-zinc-400 py-6 text-center">No active listings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-800 border-b border-white/[0.08]">
                    <tr>
                      <th className="px-5 py-4 text-sm font-medium text-zinc-400">Property</th>
                      <th className="px-5 py-4 text-sm font-medium text-zinc-400">Type</th>
                      <th className="px-5 py-4 text-sm font-medium text-zinc-400">Location</th>
                      <th className="px-5 py-4 text-sm font-medium text-zinc-400">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-zinc-900 transition-colors">
                        <td className="px-5 py-4 font-medium">{l.title}</td>
                        <td className="px-5 py-4 text-sm text-zinc-400 capitalize">{l.listingType.replace('_', ' ')}</td>
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
