'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Store, Download, Receipt, Eye, Mail, Wrench } from 'lucide-react';

const leases = [
  {
    unit: 'A1',
    tenant: 'Zenith FinTech Hub',
    location: 'Office Wing, Floor 4',
    baseRent: 2500000,
    serviceCharge: 450000,
    utilities: 120500,
    status: 'paid',
    expiry: 'Dec 2025',
  },
  {
    unit: 'B4',
    tenant: 'Global Mart Retail',
    location: 'Anchor Tenant, Ground Floor',
    baseRent: 5800000,
    serviceCharge: 1200000,
    utilities: 840000,
    status: 'overdue',
    expiry: '30 Days Left',
  },
  {
    unit: 'C9',
    tenant: 'Starlight Café',
    location: 'Terrace Zone',
    baseRent: 1200000,
    serviceCharge: 250000,
    utilities: 95000,
    status: 'partial',
    expiry: 'Aug 2024',
  },
];

const statusStyles: Record<string, { class: string; label: string }> = {
  paid: { class: 'tag-green', label: 'PAID' },
  overdue: { class: 'tag-red', label: 'OVERDUE' },
  partial: { class: 'tag-amber', label: 'PARTIAL' },
};

export default function EstateManagerCommercialLeasesPage() {
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Commercial Leases</h1>
          <p className="text-muted-foreground">Unable to load commercial lease data.</p>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Commercial Lease Collection</h1>
            <p className="text-muted-foreground mt-1">
              Managing revenue for The Platinum Plaza &amp; Business District. Automated billing for rent,
              service charges, and utility recoveries.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white hover:bg-surface-container-low transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium shadow-md">
              <Receipt className="w-4 h-4" />
              Bulk Invoice
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Collection Rate</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-primary">94.2%</p>
              <p className="text-xs text-green-600 mt-1 font-medium">+2.4% from last month</p>
            </div>
          </div>
          <div className="card p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Total Arrears</span>
              <Wrench className="w-5 h-5 text-red-600" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-red-600">₦14.2M</p>
              <p className="text-xs text-muted-foreground mt-1">12 Pending notices</p>
            </div>
          </div>
          <div className="card p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Service Charges</span>
              <Receipt className="w-5 h-5 text-secondary" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-primary">₦8.5M</p>
              <p className="text-xs text-muted-foreground mt-1">88% Recovery achieved</p>
            </div>
          </div>
          <div className="card p-5 rounded-xl bg-primary text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-secondary-fixed-dim font-bold">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Expiring Leases</span>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold">08 Units</p>
                <p className="text-sm text-primary-fixed mt-1">Renewal notices required</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Store className="w-24 h-24" />
            </div>
          </div>
        </div>

        {/* Lease Table */}
        <div className="rounded-xl border border-outline-variant shadow-sm overflow-hidden bg-white">
          <div className="p-5 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-low">
            <h3 className="font-heading font-bold text-primary">Unit Collections</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter by:</span>
              <select className="border border-outline-variant rounded-lg text-sm px-3 py-1.5 bg-white">
                <option>All Units</option>
                <option>Premium Plaza A</option>
                <option>Commercial Wing B</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Unit / Tenant</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Base Rent</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Service Charge</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Utilities</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Lease Expiry</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {leases.map((row) => (
                  <tr key={row.unit} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold">
                          {row.unit}
                        </div>
                        <div>
                          <div className="font-bold text-primary">{row.tenant}</div>
                          <div className="text-xs text-muted-foreground">{row.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-primary">₦{row.baseRent.toLocaleString()}</td>
                    <td className="px-5 py-4 text-muted-foreground">₦{row.serviceCharge.toLocaleString()}</td>
                    <td className="px-5 py-4 text-muted-foreground">₦{row.utilities.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[row.status]?.class || 'tag-gray'}`}>
                        {statusStyles[row.status]?.label || row.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-sm font-label-md">{row.expiry}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="text-primary hover:text-secondary p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-primary hover:text-secondary p-1">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Showing {leases.length} of 42 active commercial leases</div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-white">←</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-white">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-white">→</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
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

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
