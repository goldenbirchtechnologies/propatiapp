'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Store, Download, Receipt, Eye, Mail, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const leases = [
  { unit: 'A1', tenant: 'Zenith FinTech Hub', location: 'Office Wing, Floor 4', baseRent: 2500000, serviceCharge: 450000, utilities: 120500, status: 'paid', expiry: 'Dec 2025' },
  { unit: 'B4', tenant: 'Global Mart Retail', location: 'Anchor Tenant, Ground Floor', baseRent: 5800000, serviceCharge: 1200000, utilities: 840000, status: 'overdue', expiry: '30 Days Left' },
  { unit: 'C9', tenant: 'Starlight Café', location: 'Terrace Zone', baseRent: 1200000, serviceCharge: 250000, utilities: 95000, status: 'partial', expiry: 'Aug 2024' },
];

const statusStyles: Record<string, { class: string; label: string }> = {
  paid: { class: 'bg-success/10 text-[#00ff66] border border-white/[0.08]', label: 'PAID' },
  overdue: { class: 'bg-red-500/10 text-red-500 border border-white/[0.08]', label: 'OVERDUE' },
  partial: { class: 'bg-warning/10 text-warning border border-white/[0.08]', label: 'PARTIAL' },
};

export default function EstateManagerCommercialLeasesPage() {
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <ErrorBoundary>
          <div className="space-y-6">
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-white' }}>Commercial Leases</h1>
            <p className="text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Unable to load commercial lease data.</p>
            <div className="rounded-lg border border-red-500/30 bg-destructive/5 p-6">
              <p className="text-red-500 font-medium mb-1">Error</p>
              <p className="text-sm text-zinc-500 mb-3">{error}</p>
              <button onClick={() => setError(null)} className="px-4 py-2 bg-destructive text-on-error rounded-lg hover:bg-destructive/90">Retry</button>
            </div>
          </div>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-white' }}>Commercial Lease Collection</h1>
            <p className="text-xs font-label-sm uppercase tracking-wider mt-1" style={{ color: 'text-zinc-500' }}>
              Managing revenue for The Platinum Plaza &amp; Business District. Automated billing for rent, service charges, and utility recoveries.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-background hover:bg-surface transition-colors text-sm font-medium">
              <Download className="w-4 h-4" /> Export Report
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors text-sm font-medium shadow-none">
              <Receipt className="w-4 h-4" /> Bulk Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-xl border border-white/[0.08] shadow-none hover:shadow-none transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Collection Rate</span>
              <TrendingUp className="w-5 h-5 text-[#00ff66]" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-white">94.2%</p>
              <p className="text-xs text-[#00ff66] mt-1">+2.4% from last month</p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl border border-white/[0.08] shadow-none hover:shadow-none transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Total Arrears</span>
              <Wrench className="w-5 h-5 text-red-500" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-red-500">₦14.2M</p>
              <p className="text-xs font-label-sm uppercase tracking-wider mt-1" style={{ color: 'text-zinc-500' }}>12 Pending notices</p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl border border-white/[0.08] shadow-none hover:shadow-none transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Service Charges</span>
              <Receipt className="w-5 h-5" style={{ color: 'text-zinc-500' }} />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-white">₦8.5M</p>
              <p className="text-xs font-label-sm uppercase tracking-wider mt-1" style={{ color: 'text-zinc-500' }}>88% Recovery achieved</p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl border border-white/[0.08] shadow-none hover:shadow-none transition-shadow bg-primary text-on-primary relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-label-sm uppercase tracking-wider font-bold">Expiring Leases</span>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold">08 Units</p>
                <p className="text-xs font-label-sm uppercase tracking-wider opacity-80 mt-1">Renewal notices required</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] shadow-none overflow-hidden bg-background">
          <div className="p-5 border-b border-white/[0.08] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface">
            <h3 className="font-headline-sm font-bold text-white">Unit Collections</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Filter by:</span>
              <select className="border border-white/[0.08] rounded-lg text-sm px-3 py-1.5 bg-background">
                <option>All Units</option>
                <option>Premium Plaza A</option>
                <option>Commercial Wing B</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted border-b border-white/[0.08]">
                <tr>
                  <th className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Unit / Tenant</th>
                  <th className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Base Rent</th>
                  <th className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Service Charge</th>
                  <th className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Utilities</th>
                  <th className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Status</th>
                  <th className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Lease Expiry</th>
                  <th className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {leases.map((row) => (
                  <tr key={row.unit} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-container flex items-center justify-center text-white font-bold">{row.unit}</div>
                        <div>
                          <div className="font-headline-sm font-bold text-white">{row.tenant}</div>
                          <div className="text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>{row.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-white">₦{row.baseRent.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>₦{row.serviceCharge.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>₦{row.utilities.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border', statusStyles[row.status]?.class)}>{statusStyles[row.status]?.label}</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>{row.expiry}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Mail className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/[0.08] flex justify-between items-center">
            <div className="text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Showing {leases.length} of 42 active commercial leases</div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] hover:bg-background">←</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] hover:bg-background">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] hover:bg-background">→</button>
            </div>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
