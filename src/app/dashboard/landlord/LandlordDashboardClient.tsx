'use client';

import React from 'react';
import {
  Building2,
  TrendingUp,
  Plus,
  ArrowRight,
  ArrowUp,
  Store,
  Wallet,
  PieChart,
  ShieldCheck,
  Zap,
  CheckCircle,
  Download,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge, Avatar } from '@/components/ui';

interface ListingItem {
  id: string;
  title: string;
  listingType?: string;
  status?: string;
  price?: number | string;
  createdAt?: string;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  unit?: string;
  tenant?: { fullName: string } | null;
}

interface TenantAgreement {
  id: string;
  tenant: { fullName: string; avatarUrl: string | null } | null;
  listing: { title: string } | null;
  rentAmount: number;
  status: string;
}

interface Props {
  displayName: string;
  totalRevenue: number;
  listingCount: number;
  activeListingCount: number;
  occupancyRate: number;
  pendingApplicationCount: number;
  openMaintenanceCount: number;
  recentListings: ListingItem[];
  maintenanceTickets: MaintenanceTicket[];
  recentTenants: TenantAgreement[];
}

export default function LandlordDashboardClient({
  displayName,
  totalRevenue,
  listingCount,
  activeListingCount,
  occupancyRate,
  pendingApplicationCount,
  openMaintenanceCount,
  recentListings,
  maintenanceTickets,
  recentTenants,
}: Props) {
  const router = useRouter();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isEmptyAccount = listingCount === 0;
  const vacantCount = listingCount - activeListingCount;

  // Compute trend data from recentListings (last 6 months buckets)
  const monthlyRevenue = React.useMemo(() => {
    const months: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const value = recentListings
        .filter((l) => {
          if (!l.createdAt) return false;
          const ld = new Date(l.createdAt);
          return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
        })
        .reduce((sum, l) => sum + (Number(l.price) || 0), 0);
      months.push({ label, value });
    }
    return months;
  }, [recentListings]);

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.value), 1);

  const insights = [
    ...(openMaintenanceCount > 0
      ? [{
          type: 'urgent' as const,
          title: 'Open Maintenance Dispatch',
          description: `${openMaintenanceCount} maintenance ticket${openMaintenanceCount === 1 ? '' : 's'} pending dispatch or landlord approval.`,
          action: 'Review Maintenance',
          href: '/dashboard/landlord/maintenance',
        }]
      : []),
    ...(pendingApplicationCount > 0
      ? [{
          type: 'pending' as const,
          title: 'Pending Lease Applications',
          description: `${pendingApplicationCount} prospective tenant${pendingApplicationCount === 1 ? '' : 's'} completed NIN/CAC checks and awaiting final lease sign-off.`,
          action: 'Review Applications',
          href: '/dashboard/landlord/applications',
        }]
      : []),
    ...(listingCount > 0 && activeListingCount < listingCount
      ? [{
          type: 'info' as const,
          title: 'Ready for Syndication',
          description: `${vacantCount} unlisted unit${vacantCount === 1 ? '' : 's'} ready for public market feed.`,
          action: 'Publish Listings',
          href: '/dashboard/landlord/listing/new',
        }]
      : []),
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-white dark:bg-zinc-950 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Landlord Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Live Feed
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {greeting}, {displayName} — here is your real-time portfolio performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-2 text-sm font-medium transition-colors">
            <Download size={16} />
            <span>Export Ledger</span>
          </button>
          <button
            onClick={() => router.push(isEmptyAccount ? '/dashboard/landlord/properties/new' : '/dashboard/landlord/listing/new')}
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>{isEmptyAccount ? 'Add Property' : 'Add Listing'}</span>
          </button>
        </div>
      </div>

      {/* Onboarding Stepper */}
      {isEmptyAccount && (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Portfolio Activation</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Complete these steps to activate your portfolio.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-semibold">
              Step 1 of 3
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Add Master Property', done: listingCount > 0, href: '/dashboard/landlord/properties/new', num: 1 },
              { label: 'Publish Market Listings', done: activeListingCount > 0, href: '/dashboard/landlord/listing/new', num: 2 },
              { label: 'Direct Settlement Auth', done: totalRevenue > 0, href: '/dashboard/landlord/financials', num: 3 },
            ].map((step) => (
              <Link
                key={step.num}
                href={step.href}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  step.done
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {step.done ? <CheckCircle size={14} /> : step.num}
                </span>
                <span className={`text-sm ${step.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  {step.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4-Column Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Properties & Units</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Building2 size={16} className="text-zinc-600 dark:text-zinc-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{listingCount}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">assets</span>
            </div>
            {listingCount > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <ArrowUp size={12} className="text-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {vacantCount} vacant
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active Listings</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Store size={16} className="text-zinc-600 dark:text-zinc-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{activeListingCount}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">live on portal</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {listingCount - activeListingCount} in draft
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Wallet size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">
              {formatCurrency(totalRevenue)}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Revenue recorded</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Occupancy Rate</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <PieChart size={16} className="text-zinc-600 dark:text-zinc-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{occupancyRate}%</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">capacity</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle size={12} className="text-emerald-500" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeListingCount} of {listingCount} leased
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend & Actionable Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Revenue Trend</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Monthly gross collection</p>
            </div>
            <Link href="/dashboard/landlord/financials" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {totalRevenue > 0 ? (
            <div className="w-full h-48 flex items-end justify-between gap-2 px-2 pt-4 pb-2 relative">
              {/* Grid backdrop */}
              <div className="absolute inset-x-2 top-0 h-40 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="w-full h-px bg-zinc-400" />
                <div className="w-full h-px bg-zinc-400" />
                <div className="w-full h-px bg-zinc-400" />
                <div className="w-full h-px bg-zinc-400" />
              </div>
              {monthlyRevenue.map((month, idx) => {
                const isCurrent = idx === monthlyRevenue.length - 1;
                const heightPct = month.value > 0 ? Math.max(8, (month.value / maxMonthlyRevenue) * 85) : 4;
                return (
                  <div key={month.label} className="flex flex-col items-center h-full justify-end group flex-1">
                    {month.value > 0 && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-1 rounded mb-1 whitespace-nowrap z-10">
                        {formatCurrency(month.value)}
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isCurrent
                          ? 'bg-emerald-500 shadow-md'
                          : 'bg-zinc-200 dark:bg-zinc-700 group-hover:bg-emerald-500/50'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className={`text-[10px] mt-2 ${isCurrent ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {isCurrent ? `${month.label} (Cur)` : month.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <TrendingUp size={20} className="text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">No billing cycles completed yet</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                Monthly breakdown arrives with your next billing cycle.
              </p>
            </div>
          )}
          {/* Revenue Sub-Footer */}
          {totalRevenue > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 mt-4 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Net Payout (Month)</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono mt-0.5">{formatCurrency(totalRevenue * 0.93)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">WHT (10%)</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono mt-0.5">{formatCurrency(totalRevenue * 0.07)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Pending</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{formatCurrency(totalRevenue * 0.05)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actionable Insights (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Actionable Insights</h3>
              {insights.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                  {insights.length} Item{insights.length === 1 ? '' : 's'} Require Attention
                </span>
              )}
            </div>
            <Zap size={16} className="text-emerald-500" />
          </div>
          <div className="space-y-2">
            {insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                  <CheckCircle size={20} className="text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">All caught up!</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mt-1">
                  Your portfolio is running at optimal efficiency.
                </p>
              </div>
            ) : (
              insights.map((insight, idx) => (
                <Link
                  key={idx}
                  href={insight.href}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        insight.type === 'urgent' ? 'bg-red-500' : insight.type === 'pending' ? 'bg-emerald-500' : 'bg-zinc-400'
                      }`} />
                      {insight.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                      insight.type === 'urgent' ? 'bg-red-500/10 text-red-500' : insight.type === 'pending' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {insight.type === 'urgent' ? 'Urgent' : insight.type === 'pending' ? `${insight.description.match(/\d+/)?.[0] || ''} Pending` : 'Inventory'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{insight.description}</p>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 mt-1 hover:underline">
                    {insight.action} →
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Portfolio Health (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Portfolio Health</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Lagos Zone A
            </span>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">Occupancy Efficiency</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{occupancyRate}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${occupancyRate}%` }} />
              <div className="bg-red-500/40 h-full" style={{ width: `${100 - occupancyRate}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mt-2">
              <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {activeListingCount} Leased
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500/40 inline-block" /> {vacantCount} Vacant
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Avg Lease Length</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">—</p>
            </div>
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">On-Time Pay</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">—</p>
            </div>
          </div>
          <div className="mt-3 p-2.5 bg-emerald-500/5 rounded-lg flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-900 dark:text-white">Compliance</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">LASRERA registered</span>
            </div>
          </div>
        </div>

        {/* Recent Maintenance (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Maintenance</h3>
              {openMaintenanceCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                  {openMaintenanceCount} Open
                </span>
              )}
            </div>
            <Link href="/dashboard/landlord/maintenance" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {maintenanceTickets.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">No open maintenance tickets.</p>
            ) : (
              maintenanceTickets.slice(0, 3).map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/landlord/maintenance/${t.id}`}
                  className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white leading-tight">{t.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase shrink-0 ${
                      t.priority === 'Critical' ? 'bg-red-500/10 text-red-500' : t.priority === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                    <span>{t.unit || ''}</span>
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
          {openMaintenanceCount > 0 && (
            <Link href="/dashboard/landlord/maintenance" className="mt-3 w-full py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium text-center transition-colors flex items-center justify-center gap-1">
              Open Maintenance Console <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Recent Tenancies (4 cols) */}
        <div className="lg:col-span-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Tenancies</h3>
            <Link href="/dashboard/landlord/tenants" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline">
              Directory <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTenants.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">No tenants yet.</p>
            ) : (
              recentTenants.slice(0, 4).map((t) => (
                <div key={t.id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar src={t.tenant?.avatarUrl || undefined} name={t.tenant?.fullName || 'T'} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{t.tenant?.fullName || 'Tenant'}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{t.listing?.title || '—'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">{formatCurrency(t.rentAmount)}</span>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
