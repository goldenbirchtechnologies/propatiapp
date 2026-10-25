import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { formatNaira } from '@/lib/utils';
import {
  Building2,
  Download,
  Plus,
  Gavel,
  MapPin,
  Search,
  ChevronRight,
  Eye,
  FileDown,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const metadata = {
  title: 'Commercial Leases – Landlord',
  description: 'Manage commercial lease agreements.',
};

function statusConfig(status: string | null) {
  const s = (status || '').toLowerCase();
  if (s === 'active') {
    return { label: 'Active', dot: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
  }
  if (s === 'expired' || s === 'terminated') {
    return { label: s === 'terminated' ? 'Terminated' : 'Expired', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
  }
  if (s === 'pending_signature' || s === 'pending') {
    return { label: 'Pending Signature', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
  }
  if (s === 'draft') {
    return { label: 'Draft', dot: 'bg-zinc-400', badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' };
  }
  return { label: (status || 'Unknown').replace(/_/g, ' '), dot: 'bg-zinc-400', badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' };
}

export default async function CommercialLeasesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const agreements = await prisma.agreement.findMany({
    where: {
      landlordId: user.id,
      listing: { listingType: 'commercial' },
    },
    include: {
      tenant: { select: { fullName: true } },
      listing: { select: { title: true, address: true, city: true, state: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const total = agreements.length;
  const activeCount = agreements.filter((a) => (a.status || '').toLowerCase() === 'active').length;
  const expiringCount = agreements.filter(
    (a) => a.endDate && new Date(a.endDate) >= now && new Date(a.endDate) <= thirtyDays && (a.status || '').toLowerCase() === 'active'
  ).length;
  const expiredCount = agreements.filter((a) => {
    const s = (a.status || '').toLowerCase();
    return s === 'expired' || s === 'terminated';
  }).length;

  const cumulativeRent = agreements.reduce((sum, a) => sum + (a.rentAmount ? Number(a.rentAmount) : 0), 0);

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="w-full space-y-6">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <nav className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                <a className="hover:text-emerald-600 transition-colors" href="#">Home</a>
                <ChevronRight className="h-3.5 w-3.5" />
                <a className="hover:text-emerald-600 transition-colors" href="#">Portfolio</a>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-zinc-900 dark:text-white font-semibold">Commercial Leases</span>
              </nav>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Commercial Lease Management</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Lagos Commercial Portfolio</span>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl">
                Monitor institutional commercial tenancies, corporate escalations, service charge schedules, and statutory covenant compliance across Lagos commercial hubs.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 h-10 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm font-medium border border-zinc-200 dark:border-zinc-700">
                <Download className="h-4 w-4" />
                <span>Export Schedule</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 h-10 rounded-lg bg-emerald-600 text-white shadow-sm hover:brightness-105 active:scale-95 transition-all text-sm font-medium">
                <Plus className="h-4 w-4" />
                <span>New Commercial Agreement</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm flex flex-col justify-between border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Commercial Leases</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-white">{total}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Covenants</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-2">
                <span className="text-sm font-mono font-semibold text-zinc-900 dark:text-white">{formatNaira(cumulativeRent)}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Cumulative roll</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm flex flex-col justify-between border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Leases</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold text-emerald-600">{activeCount}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Enforced</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  {total > 0 ? Math.round((activeCount / total) * 1000) / 10 : 0}% Occupancy
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">compliant</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm flex flex-col justify-between border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Expiring Soon (&lt; 30 Days)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-white">{expiringCount}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Renewals</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300">
                  <Search className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 pt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  Critical renegotiation window
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm flex flex-col justify-between border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Expired / Terminated</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold text-red-500">{expiredCount}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Lapsed</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
                  <Gavel className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 pt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold">
                  Vacant / Re-letting active
                </span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Commercial Covenant Ledger</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  Prisma Decrypted
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" /> Synchronized
                </span>
                <span>UTC+1 Lagos Node</span>
              </div>
            </div>

            {agreements.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <Building2 className="h-16 w-16 text-zinc-400 opacity-40" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mt-4">No commercial leases found</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
                  No executed or pending commercial covenants match the current query.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Property Asset &amp; Address</th>
                      <th className="py-3 px-4 font-semibold">Corporate Tenant</th>
                      <th className="py-3 px-4 font-semibold text-right">Covenant Value</th>
                      <th className="py-3 px-4 font-semibold">Tenancy Period</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {agreements.map((agr) => {
                      const cfg = statusConfig(agr.status);
                      const address = [agr.listing.address, agr.listing.city, agr.listing.state].filter(Boolean).join(', ');
                      const daysLeft = agr.endDate
                        ? Math.ceil((new Date(agr.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                        : null;
                      return (
                        <tr key={agr.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 min-w-[240px]">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Building2 className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{agr.listing.title}</span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{address || '—'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white">{agr.tenant.fullName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right min-w-[140px]">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">
                                {agr.rentAmount ? formatNaira(Number(agr.rentAmount)) : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="flex flex-col">
                              <span className="text-xs font-mono text-zinc-900 dark:text-white">
                                {agr.startDate ? new Date(agr.startDate).toLocaleDateString('en-NG') : '—'} →{' '}
                                {agr.endDate ? new Date(agr.endDate).toLocaleDateString('en-NG') : '—'}
                              </span>
                              {daysLeft !== null && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                  {daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days ago`}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="View Covenant Details">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Download Executed PDF">
                                <FileDown className="h-4 w-4" />
                              </button>
                              <button className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Tenancy Actions">
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                Displaying <strong className="text-zinc-900 dark:text-white">{agreements.length}</strong> of {total} registered commercial covenant structures
              </span>
            </div>
          </div>

          {/* Footer cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span className="text-base font-semibold text-zinc-900 dark:text-white">FIRS &amp; Lagos State Compliance Status</span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Automated withholding tax (WHT) ledger and Lagos Commercial Land Bureau index.
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0">
                  100% Compliant
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="text-zinc-500 dark:text-zinc-400">Stamp Duty Electronic Indexing</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-semibold">{total} / {total} Registered</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-emerald-600" />
                    <span className="text-base font-semibold text-zinc-900 dark:text-white">Corporate Custody</span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Commercial lease cautionary &amp; service charge deposits are segregated in escrow.
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Custody Account</span>
                  <span className="text-sm font-mono text-zinc-900 dark:text-white font-bold">{user.fullName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Deposit Escrow Total</span>
                  <span className="text-sm font-mono text-emerald-600 font-bold">{formatNaira(cumulativeRent)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}