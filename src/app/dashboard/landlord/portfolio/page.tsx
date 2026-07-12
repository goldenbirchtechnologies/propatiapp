'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Building2, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const units = [
  { id: 'u1', name: 'The Obsidian Penthouse', location: 'Victoria Island', value: 850000000, yield: '12.4%', occupancy: 98 },
  { id: 'u2', name: 'Lekki Phase 1 Flat', location: 'Lekki', value: 320000000, yield: '9.8%', occupancy: 95 },
  { id: 'u3', name: 'Ikeja GRA Apartment', location: 'Ikeja', value: 210000000, yield: '8.5%', occupancy: 90 },
];

export default function LandlordPortfolioAnalyticsPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Portfolio Analytics</h1>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-destructive font-medium">Unable to load portfolio</p>
            <p className="text-destructive text-sm mt-1">{error}</p>
            <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive">Retry</button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  const totalValue = units.reduce((sum, u) => sum + u.value, 0);

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio Analytics</h1>
          <p className="text-muted-foreground mt-1">Overview of your owned properties and asset performance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Portfolio Value</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary mt-2">₦{(totalValue / 1e6).toFixed(0)}M</p>
          </div>
          <div className="card p-5 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Avg. Yield</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success mt-2">10.2%</p>
          </div>
          <div className="card p-5 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Properties</span>
              <Building2 className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-primary mt-2">{units.length} Units</p>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant shadow-sm overflow-hidden bg-surface-container-lowest">
          <div className="p-5 border-b border-outline-variant">
            <h3 className="font-heading font-bold text-primary">Properties</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Property</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Value</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Yield</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {units.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-4 font-medium text-primary">{u.name}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{u.location}</td>
                    <td className="px-5 py-4 text-sm font-medium text-primary">₦{u.value.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-success font-medium">{u.yield}</td>
                    <td className="px-5 py-4 text-sm text-primary">{u.occupancy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
