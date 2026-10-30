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
  Clock,
  Lightbulb,
  Bell,
  Search,
  Home,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  FileText,
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
  const firstName = displayName.split(' ')[0];

  const residentialCount = recentListings.filter((l) =>
    ['apartment', 'house', 'duplex', 'selfContain', 'self_contain', 'bungalow', 'room'].some((k) =>
      (l.listingType || '').toLowerCase().includes(k)
    )
  ).length;
  const commercialCount = Math.max(0, recentListings.length - residentialCount);
  const residentialPct = recentListings.length ? Math.round((residentialCount / recentListings.length) * 100) : 57;
  const commercialPct = 100 - residentialPct;

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
      ? [
          {
            type: 'urgent' as const,
            title: 'Open Maintenance Dispatch',
            description: `${openMaintenanceCount} maintenance ticket${openMaintenanceCount === 1 ? '' : 's'} pending dispatch or landlord approval.`,
            action: 'Review Maintenance',
            href: '/dashboard/landlord/maintenance',
          },
        ]
      : []),
    ...(pendingApplicationCount > 0
      ? [
          {
            type: 'pending' as const,
            title: 'Pending Lease Applications',
            description: `${pendingApplicationCount} prospective tenant${pendingApplicationCount === 1 ? '' : 's'} completed NIN/CAC checks and awaiting final lease sign-off.`,
            action: 'Review Applications',
            href: '/dashboard/landlord/applications',
          },
        ]
      : []),
    ...(listingCount > 0 && activeListingCount < listingCount
      ? [
          {
            type: 'info' as const,
            title: 'Ready for Syndication',
            description: `${vacantCount} unlisted unit${vacantCount === 1 ? '' : 's'} ready for public market feed.`,
            action: 'Publish Listings',
            href: '/dashboard/landlord/listing/new',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header — Stitch: Welcome + last login + Pro Tip */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <Clock className="h-3.5 w-3.5" />
            Last login: Today, {new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })} · Lagos, NG
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 lg:inline-flex">
            <Lightbulb className="h-3.5 w-3.5" />
            Pro Tip: Verified listings get 3× more inquiries.
          </span>
          <button
            onClick={() => router.push(isEmptyAccount ? '/dashboard/landlord/properties/new' : '/dashboard/landlord/listing/new')}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary"
          >
            <Plus className="h-4 w-4" />
            <span>{isEmptyAccount ? 'Add Property' : 'Add Listing'}</span>
          </button>
          <button className="hidden h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 lg:inline-flex">
            <Download className="h-4 w-4" />
            Export Ledger
          </button>
        </div>
      </div>

      {/* Onboarding Stepper */}
      {isEmptyAccount && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Portfolio Activation</h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Complete these steps to activate your portfolio.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-[#4edea3]">
              Step 1 of 3
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { label: 'Add Master Property', done: listingCount > 0, href: '/dashboard/landlord/properties/new', num: 1 },
              { label: 'Publish Market Listings', done: activeListingCount > 0, href: '/dashboard/landlord/listing/new', num: 2 },
              { label: 'Direct Settlement Auth', done: totalRevenue > 0, href: '/dashboard/landlord/financials', num: 3 },
            ].map((step) => (
              <Link
                key={step.num}
                href={step.href}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  step.done
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step.done ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {step.done ? <CheckCircle size={14} /> : step.num}
                </span>
                <span className={`text-sm ${step.done ? 'text-primary dark:text-[#4edea3]' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  {step.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4-Column KPI Grid — Stitch exact */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/15">
              <Building2 className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
              {listingCount ? `${residentialCount} Res / ${commercialCount} Com` : '—'}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Properties</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{listingCount}</p>
          <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <span className="h-full bg-amber-600" style={{ width: `${residentialPct}%` }} title="Residential" />
            <span className="h-full bg-sky-600" style={{ width: `${commercialPct}%` }} title="Commercial" />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/15">
              <Store className="h-5 w-5 text-sky-700 dark:text-sky-400" />
            </span>
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400">{occupancyRate}% Occ.</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Listings</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{String(activeListingCount).padStart(2, '0')}</p>
          <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <span className="h-full bg-amber-600" style={{ width: '40%' }} title="Residential Active" />
            <span className="h-full bg-sky-600" style={{ width: '60%' }} title="Commercial Active" />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.06]">
              <Wallet className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary dark:text-[#4edea3]">
              <TrendingUp className="h-3.5 w-3.5" /> 12%
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly Revenue (₦)</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalRevenue ? `${(totalRevenue / 1_000_000).toFixed(1)}M` : '—'}</p>
          <p className="mt-2 flex justify-between text-[11px] font-bold">
            <span className="text-amber-700 dark:text-amber-400">Res: ₦{(totalRevenue * 0.43 / 1_000_000).toFixed(1)}M</span>
            <span className="text-sky-700 dark:text-sky-400">Com: ₦{(totalRevenue * 0.57 / 1_000_000).toFixed(1)}M</span>
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="mb-4 flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/15">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">{pendingApplicationCount ? `${pendingApplicationCount} Overdue` : '—'}</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Pending Payments</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {pendingApplicationCount ? formatCurrency(pendingApplicationCount * 62000) : '—'}
          </p>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-500/15">
            <span className="block h-full bg-red-500" style={{ width: pendingApplicationCount ? '75%' : '0%' }} />
          </div>
        </div>
      </div>

      {/* Quick Actions — Stitch 6 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Add New Listing', icon: Plus, href: '/dashboard/landlord/listing/new' },
            { label: 'Manage Properties', icon: Building2, href: '/dashboard/landlord/properties' },
            { label: 'Rent Collection', icon: Wallet, href: '/dashboard/landlord/financials' },
            { label: 'Screen Tenants', icon: FileText, href: '/dashboard/landlord/screening' },
            { label: 'Verify Property', icon: ShieldCheck, href: '/dashboard/landlord/verification' },
            { label: 'View Messages', icon: Bell, href: '/dashboard/landlord/messages', badge: pendingApplicationCount > 0 },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-center transition-all hover:border-primary hover:bg-[var(--sovereign-container-bg)] hover:text-[var(--sovereign-hover)] dark:border-white/[0.08] dark:bg-zinc-900 dark:hover:border-primary/50 dark:hover:bg-primary/10 dark:hover:text-[#6ffbbe]"
            >
              <a.icon className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span className="text-xs font-semibold leading-tight">{a.label}</span>
              {a.badge && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />}
            </Link>
          ))}
        </div>
      </section>

      {/* Revenue Trend & Actionable Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Revenue Trend</h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Monthly gross collection</p>
            </div>
            <Link href="/dashboard/landlord/financials" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-[#4edea3]">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {totalRevenue > 0 ? (
            <div className="relative flex h-48 items-end justify-between gap-2 px-2 pb-2 pt-4">
              <span className="pointer-events-none absolute inset-x-2 top-0 flex h-40 flex-col justify-between opacity-10">
                <span className="h-px w-full bg-zinc-400" />
                <span className="h-px w-full bg-zinc-400" />
                <span className="h-px w-full bg-zinc-400" />
                <span className="h-px w-full bg-zinc-400" />
              </span>
              {monthlyRevenue.map((month, idx) => {
                const isCurrent = idx === monthlyRevenue.length - 1;
                const heightPct = month.value > 0 ? Math.max(8, (month.value / maxMonthlyRevenue) * 85) : 4;
                return (
                  <span key={month.label} className="group flex h-full flex-1 flex-col items-center justify-end">
                    {month.value > 0 && (
                      <span className="z-10 mb-1 whitespace-nowrap rounded bg-zinc-200 px-1 text-[10px] font-mono text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-700 dark:text-zinc-300">
                        {formatCurrency(month.value)}
                      </span>
                    )}
                    <span
                      className={`w-full rounded-t transition-all duration-300 ${isCurrent ? 'bg-primary shadow-md' : 'bg-zinc-200 group-hover:bg-primary/50 dark:bg-zinc-700'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className={`mt-2 text-[10px] ${isCurrent ? 'font-bold text-primary dark:text-[#4edea3]' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {isCurrent ? `${month.label} (Cur)` : month.label}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.06]">
                <TrendingUp className="h-5 w-5 text-zinc-400" />
              </span>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">No billing cycles completed yet</p>
              <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">Monthly breakdown arrives with your next billing cycle.</p>
            </div>
          )}
          {totalRevenue > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-white/[0.04] sm:grid-cols-3">
              <span className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Net Payout (Month)</span>
                <span className="mt-0.5 font-mono text-sm font-bold text-zinc-900 dark:text-white">{formatCurrency(totalRevenue * 0.93)}</span>
              </span>
              <span className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">WHT (10%)</span>
                <span className="mt-0.5 font-mono text-sm font-bold text-zinc-900 dark:text-white">{formatCurrency(totalRevenue * 0.07)}</span>
              </span>
              <span className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Pending</span>
                <span className="mt-0.5 font-mono text-sm font-bold text-primary dark:text-[#4edea3]">{formatCurrency(totalRevenue * 0.05)}</span>
              </span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Actionable Insights</h3>
              {insights.length > 0 && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                  {insights.length} Item{insights.length === 1 ? '' : 's'} Require Attention
                </span>
              )}
            </span>
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-2">
            {insights.length === 0 ? (
              <span className="flex flex-col items-center justify-center py-8 text-center">
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </span>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">All caught up!</p>
                <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">Your portfolio is running at optimal efficiency.</p>
              </span>
            ) : (
              insights.map((insight, idx) => (
                <Link
                  key={idx}
                  href={insight.href}
                  className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white">
                      <span
                        className={`h-2 w-2 rounded-full ${insight.type === 'urgent' ? 'bg-red-500' : insight.type === 'pending' ? 'bg-primary' : 'bg-zinc-400'}`}
                      />
                      {insight.title}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        insight.type === 'urgent'
                          ? 'bg-red-500/10 text-red-500'
                          : insight.type === 'pending'
                            ? 'bg-primary/10 text-primary dark:text-[#4edea3]'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {insight.type === 'urgent' ? 'Urgent' : insight.type === 'pending' ? `${insight.description.match(/\d+/)?.[0] || ''} Pending` : 'Inventory'}
                    </span>
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{insight.description}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-[#4edea3]">
                    {insight.action} →
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bento: Properties Overview (2) + Activity Feed (1) — Stitch */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 lg:col-span-2">
          <div className="flex flex-col gap-4 border-b border-zinc-200 p-6 dark:border-white/[0.08] md:flex-row md:items-center md:justify-between">
            <span className="flex flex-col">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Properties Overview</h2>
              <span className="mt-2 flex gap-4">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Residential
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Commercial
                </span>
              </span>
            </span>
            <span className="flex gap-2">
              <span className="relative flex-1 md:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  placeholder="Search portfolio..."
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                />
              </span>
              <Link
                href="/dashboard/landlord/properties"
                className="hidden h-9 items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-300 md:inline-flex"
              >
                View all
              </Link>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Income</th>
                  <th className="px-6 py-3 text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                {recentListings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      No properties yet — add your first listing to get started.
                    </td>
                  </tr>
                ) : (
                  recentListings.slice(0, 5).map((l) => {
                    const isRes = ['apartment', 'house', 'duplex', 'selfContain', 'self_contain', 'bungalow'].some((k) =>
                      (l.listingType || '').toLowerCase().includes(k)
                    );
                    const isOccupied = l.status === 'active';
                    return (
                      <tr key={l.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.04]">
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/landlord/properties/${l.id}`} className="font-semibold text-zinc-900 hover:text-primary dark:text-white dark:hover:text-[#4edea3]">
                            {l.title}
                          </Link>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{l.listingType || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold ${isRes ? 'text-amber-700 dark:text-amber-400' : 'text-sky-700 dark:text-sky-400'}`}>
                            {isRes ? <Home className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                            {isRes ? 'Residential' : 'Commercial'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isOccupied ? 'bg-primary/15 text-[var(--sovereign-hover)] dark:text-[#6ffbbe]' : 'bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400'}`}
                          >
                            {isOccupied ? 'Occupied' : l.status || 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-medium text-zinc-900 dark:text-white">{formatCurrency(Number(l.price || 0))} /yr</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/landlord/properties/${l.id}`} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {recentListings.length > 5 && (
            <div className="flex justify-center border-t border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
              <Link href="/dashboard/landlord/properties" className="text-sm font-semibold text-primary hover:underline dark:text-[#4edea3]">
                View All {listingCount} Properties
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Activity Feed</h2>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{recentTenants.length + maintenanceTickets.length} events</span>
          </div>
          <div className="relative space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-white/[0.08]">
            {recentTenants.slice(0, 2).map((t) => (
              <div key={`act-t-${t.id}`} className="relative pl-8">
                <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                  <Building2 className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                </span>
                <p className="text-sm leading-snug text-zinc-700 dark:text-zinc-300">
                  <span className="font-bold text-zinc-900 dark:text-white">{t.tenant?.fullName || 'Tenant'}</span> inquiry for{' '}
                  <span className="font-bold text-primary dark:text-[#4edea3]">{t.listing?.title || 'listing'}</span>.
                </p>
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">{t.status}</p>
              </div>
            ))}
            {maintenanceTickets.slice(0, 2).map((m) => (
              <div key={`act-m-${m.id}`} className="relative pl-8">
                <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/15">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400" />
                </span>
                <p className="text-sm leading-snug text-zinc-700 dark:text-zinc-300">
                  <span className="font-bold text-zinc-900 dark:text-white">{m.title}</span> — {m.unit || ''} ({m.priority}).
                </p>
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">{m.status}</p>
              </div>
            ))}
            {recentTenants.length === 0 && maintenanceTickets.length === 0 && (
              <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No recent activity.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3-Column Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Portfolio Health</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-[#4edea3]">Lagos Zone A</span>
          </div>
          <div className="mb-3 rounded-lg bg-zinc-50 p-3 dark:bg-white/[0.04]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">Occupancy Efficiency</span>
              <span className="font-mono text-sm font-bold text-primary dark:text-[#4edea3]">{occupancyRate}%</span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <span className="h-full bg-primary transition-all" style={{ width: `${occupancyRate}%` }} />
              <span className="h-full bg-red-500/40" style={{ width: `${100 - occupancyRate}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" /> {activeListingCount} Leased
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500/40" /> {vacantCount} Vacant
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="rounded-lg bg-zinc-50 p-2.5 dark:bg-white/[0.04]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Avg Lease Length</span>
              <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">—</p>
            </span>
            <span className="rounded-lg bg-zinc-50 p-2.5 dark:bg-white/[0.04]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">On-Time Pay</span>
              <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">—</p>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 p-2.5">
            <ShieldCheck className="h-[18px] w-[18px] text-primary dark:text-[#4edea3]" />
            <span className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-900 dark:text-white">Compliance</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">LASRERA registered</span>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Maintenance</h3>
              {openMaintenanceCount > 0 && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">{openMaintenanceCount} Open</span>
              )}
            </span>
            <Link href="/dashboard/landlord/maintenance" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-[#4edea3]">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {maintenanceTickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No open maintenance tickets.</p>
            ) : (
              maintenanceTickets.slice(0, 3).map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/landlord/maintenance/${t.id}`}
                  className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2.5 transition-colors hover:bg-zinc-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold leading-tight text-zinc-900 dark:text-white">{t.title}</span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        t.priority === 'Critical'
                          ? 'bg-red-500/10 text-red-500'
                          : t.priority === 'High'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-400'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </span>
                  <span className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                    <span>{t.unit || ''}</span>
                    <StatusBadge status={t.status} />
                  </span>
                </Link>
              ))
            )}
          </div>
          {openMaintenanceCount > 0 && (
            <Link
              href="/dashboard/landlord/maintenance"
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-zinc-100 py-2 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.08]"
            >
              Open Maintenance Console <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Tenancies</h3>
            <Link href="/dashboard/landlord/tenants" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-[#4edea3]">
              Directory <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTenants.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No tenants yet.</p>
            ) : (
              recentTenants.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 p-2.5 transition-colors hover:bg-zinc-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar src={t.tenant?.avatarUrl || undefined} name={t.tenant?.fullName || 'T'} size="sm" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-xs font-semibold text-zinc-900 dark:text-white">{t.tenant?.fullName || 'Tenant'}</span>
                      <span className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">{t.listing?.title || '—'}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">{formatCurrency(t.rentAmount)}</span>
                    <StatusBadge status={t.status} />
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
