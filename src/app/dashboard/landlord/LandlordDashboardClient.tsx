'use client';

import React, { useState } from 'react';
import {
  Home,
  Users,
  DollarSign,
  ClipboardList,
  TrendingUp,
  Plus,
  AlertTriangle,
  ArrowRight,
  Search,
  Bell,
  ChevronDown,
  Box,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import {
  PageHeader,
  StatCard,
  Progress,
  StatusBadge,
  SectionLabel,
  Avatar,
  InteractiveHoverButton,
} from '@/components/ui';


const onboardingSteps = [
  { id: 'property', label: 'Add your first property', done: false, href: '/dashboard/landlord/properties/new' },
  { id: 'listing', label: 'Publish a listing to marketplace', done: false, href: '/dashboard/landlord/listing/new' },
  { id: 'payout', label: 'Setup payout bank', done: false, href: '/dashboard/landlord/financials' },
  { id: 'tenant', label: 'Invite your first tenant', done: false, href: '/dashboard/landlord/tenants' },
];

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
  const [query, setQuery] = useState('');

  const filtered = recentListings.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.listingType || '').toLowerCase().includes(q)
    );
  });

  // Only real, computed metrics — hardcoded bars (rent collected, profile
  // completeness) previously showed healthy values regardless of data.
  const portfolioHealthItems = [
    { label: 'Occupancy', value: occupancyRate, color: '#10b981' },
  ];

  const router = useRouter();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isEmptyAccount = listingCount === 0;
  const completedSteps = [
    listingCount > 0,
    activeListingCount > 0,
    totalRevenue > 0,
  ].filter(Boolean).length;
  const onboardingProgress = Math.round((completedSteps / 3) * 100);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] dark:bg-[#09090b]">
      <PageHeader
        title="Landlord Dashboard"
        description={`${greeting}, ${displayName}. Here's an overview of your portfolio.`}
        actions={
          <InteractiveHoverButton
            onClick={() => router.push(isEmptyAccount ? '/dashboard/landlord/properties/new' : '/dashboard/landlord/listing/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Plus size={14} /> {isEmptyAccount ? 'Add Property' : 'Add Listing'}
          </InteractiveHoverButton>
        }
      />

      {isEmptyAccount ? (
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm">Get started with PROPATI</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Complete these steps to start earning from your properties</p>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{completedSteps} of 3 completed</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#27272a] mb-5">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${onboardingProgress}%` }} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'Add your first property', href: '/dashboard/landlord/properties/new', done: listingCount > 0, num: 1 },
              { label: 'Publish a listing', href: '/dashboard/landlord/listing/new', done: activeListingCount > 0, num: 2 },
              { label: 'Setup payout bank', href: '/dashboard/landlord/financials', done: totalRevenue > 0, num: 3 },
            ].map((step) => (
              <Link
                key={step.num}
                href={step.href}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${step.done ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b] hover:border-zinc-600'}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-[#27272a]'}`}>
                  {step.done ? '✓' : step.num}
                </span>
                <span className={`text-sm ${step.done ? 'text-emerald-400' : 'text-zinc-300'}`}>{step.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Properties" value={String(listingCount)} sub={`${listingCount - activeListingCount} vacant`} icon={Home} />
          <StatCard label="Active Listings" value={String(activeListingCount)} sub={`across ${new Set(recentListings.map((l) => l.listingType).filter(Boolean)).size} types`} icon={ClipboardList} />
          <StatCard label="Monthly Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
          <StatCard label="Occupancy Rate" value={`${occupancyRate}%`} icon={TrendingUp} />
        </div>
      )}

      {/* Charts + Actionable Insights */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm">Revenue Trend</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">Last 12 months · Monthly revenue</p>
            </div>
            <Link href="/dashboard/landlord/financials" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {totalRevenue > 0 ? (
            <div className="h-32 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b]">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Monthly breakdown arrives with your next billing cycle.
              </p>
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b]">
              <p className="text-sm text-zinc-300">No revenue recorded yet</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">
                Rent payments will appear here once your first tenant pays.
              </p>
            </div>
          )}
        </div>

        {/* Actionable Insights — replaces nav-duplicate Quick Actions */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm mb-4">Actionable Insights</h3>
          <div className="space-y-2">
            {openMaintenanceCount > 0 && (
              <Link href="/dashboard/landlord/maintenance" className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500/15">
                  <AlertTriangle size={15} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{openMaintenanceCount} maintenance ticket{openMaintenanceCount === 1 ? '' : 's'} needs attention</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Resolve urgent requests</p>
                </div>
                <ArrowRight size={12} className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 shrink-0" />
              </Link>
            )}
            {pendingApplicationCount > 0 && (
              <Link href="/dashboard/landlord/applications" className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/15">
                  <ClipboardList size={15} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{pendingApplicationCount} application{pendingApplicationCount === 1 ? '' : 's'} awaiting review</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Review and approve tenants</p>
                </div>
                <ArrowRight size={12} className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 shrink-0" />
              </Link>
            )}
            {listingCount > 0 && activeListingCount === 0 && (
              <Link href="/dashboard/landlord/listing/new" className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/15">
                  <Plus size={15} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">No active listings</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Publish a listing to find tenants</p>
                </div>
                <ArrowRight size={12} className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 shrink-0" />
              </Link>
            )}
            {openMaintenanceCount === 0 && pendingApplicationCount === 0 && !(listingCount > 0 && activeListingCount === 0) && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                  <Plus size={16} className="text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">All caught up</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">No urgent actions right now</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio health */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm mb-4">Portfolio Health</h3>
          <div className="space-y-4">
            {portfolioHealthItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-500 dark:text-zinc-400">{item.label}</span>
                  <span className="text-zinc-900 dark:text-white font-medium">{item.value}%</span>
                </div>
                <Progress value={item.value} color={item.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent tenants */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm">Recent Tenants</h3>
            <Link href="/dashboard/landlord/tenants" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              All tenants <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTenants.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">No tenants yet.</p>
            ) : (
              recentTenants.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-zinc-200 dark:border-[#27272a] last:border-0">
                  <Avatar
                    src={t.tenant?.avatarUrl || undefined}
                    name={t.tenant?.fullName || 'T'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-900 dark:text-white text-sm font-medium">{t.tenant?.fullName || 'Tenant'}</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs">{t.listing?.title || '—'}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-zinc-300 text-xs font-medium">{formatCurrency(t.rentAmount)}</div>
                    <div className="mt-0.5"><StatusBadge status={t.status} /></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alerts + Maintenance */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Requires Attention
          </h3>
          <div className="space-y-2">
            {[
              pendingApplicationCount > 0 && {
                type: 'info',
                msg: `${pendingApplicationCount} application${pendingApplicationCount === 1 ? '' : 's'} awaiting review`,
                path: '/dashboard/landlord/applications',
              },
              openMaintenanceCount > 0 && {
                type: 'warning',
                msg: `${openMaintenanceCount} open maintenance request${openMaintenanceCount === 1 ? '' : 's'}`,
                path: '/dashboard/landlord/maintenance',
              },
              listingCount === 0 && {
                type: 'info',
                msg: 'Add your first property to start collecting rent',
                path: '/dashboard/landlord/properties',
              },
            ]
              .filter(Boolean)
              .map((alert, i) => {
                const a = alert as { type: string; msg: string; path: string };
                return (
                  <Link
                    key={i}
                    href={a.path}
                    className="flex items-start gap-2.5 p-3 rounded-lg hover:bg-zinc-50 dark:bg-[#18181b] transition-colors border border-transparent hover:border-zinc-200 dark:border-[#27272a]"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        a.type === 'warning' ? 'bg-amber-400' : a.type === 'info' ? 'bg-blue-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-sm text-zinc-300 hover:text-zinc-900 dark:text-white">{a.msg}</span>
                  </Link>
                );
              })}
            {pendingApplicationCount === 0 && openMaintenanceCount === 0 && listingCount > 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 text-center py-4">Nothing needs your attention.</p>
            )}
          </div>
        </div>

        {/* Maintenance */}
        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-900 dark:text-zinc-900 dark:text-white font-semibold text-sm">Open Maintenance</h3>
            <Link href="/dashboard/landlord/maintenance" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all <ArrowRight size={11} />
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
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 dark:bg-[#18181b] border border-transparent hover:border-zinc-200 dark:border-[#27272a] transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    t.priority === 'Critical' ? 'bg-red-400' : t.priority === 'High' ? 'bg-amber-400' : 'bg-zinc-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-900 dark:text-white text-xs font-medium">{t.title}</div>
                    <div className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 text-xs">{t.unit || ''} · {t.tenant?.fullName || ''}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}