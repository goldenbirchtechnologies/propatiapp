'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Home, CreditCard, Wrench, Calendar, ArrowRight, CheckCircle, Clock,
  Download, Phone, Bookmark, Key, Receipt, Plus, ChevronRight, MapPin,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Agreement {
  id: string;
  listing?: { title?: string; address?: string; price?: number; pricePeriod?: string };
  status: string;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  createdAt: string;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
}

interface ActiveAgreement {
  id: string;
  listing: {
    title: string;
    address: string;
    price?: number;
    pricePeriod?: string;
    images?: { url: string }[];
  };
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  landlordId?: string | null;
}

interface Props {
  displayName: string;
  savedCount: number;
  activeAgreementCount: number;
  openMaintenanceCount: number;
  recentAgreements: Agreement[];
  recentTransactions: Transaction[];
  activeAgreement: ActiveAgreement | null;
  tickets?: MaintenanceTicket[];
}

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm';

export default function TenantDashboardClient({
  displayName,
  savedCount,
  activeAgreementCount,
  openMaintenanceCount,
  recentTransactions,
  activeAgreement,
  tickets = [],
}: Props) {
  const firstName = (displayName || 'Tenant').split(' ')[0];

  let daysUntilRent: number | null = null;
  let leaseMonthsLeft: number | null = null;
  let leaseProgress = 0;
  if (activeAgreement?.startDate && activeAgreement?.endDate) {
    const start = new Date(activeAgreement.startDate);
    const end = new Date(activeAgreement.endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    leaseProgress = total > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))) : 0;
    daysUntilRent = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    leaseMonthsLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000)));
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1560px] mx-auto">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tenancy Portal Active
            </span>
            <span className="text-zinc-300 dark:text-zinc-600 text-xs">•</span>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">
              Unit: {activeAgreement?.listing?.title ?? '—'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">My Home</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Welcome back, {firstName}. Here&apos;s what&apos;s happening with your tenancy.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link href="/listings" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white text-sm font-semibold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
            <Home className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            Browse Listings
          </Link>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Days Until Rent', value: daysUntilRent != null ? `${daysUntilRent}d` : '—', suffix: daysUntilRent != null ? `Due ${formatDate(activeAgreement!.endDate!)}` : 'No active lease', icon: Calendar },
          { label: 'Lease Remaining', value: leaseMonthsLeft != null ? `${leaseMonthsLeft} mo` : '—', suffix: activeAgreement?.endDate ? `Expires ${formatDate(activeAgreement.endDate)}` : 'No active lease', icon: Key },
          { label: 'Open Tickets', value: String(openMaintenanceCount), suffix: 'active', icon: Wrench },
          { label: 'Saved Properties', value: String(savedCount), suffix: 'units', icon: Bookmark },
        ].map((k) => (
          <div key={k.label} className={`relative overflow-hidden ${card} p-4 sm:p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{k.label}</span>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <k.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{k.value}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{k.suffix}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Main 3-col: Current Lease (2) + Next Payment (1) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Lease Card */}
        <div className={`${card} lg:col-span-2 p-5 sm:p-6 flex flex-col justify-between`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-white/[0.06]">
              <div className="flex flex-col">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">Lease Agreement • Primary Unit</span>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Current Lease</h2>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-sm">{activeAgreement?.listing?.address ?? '—'}</span>
                </div>
              </div>
              <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Lease
              </span>
            </div>

            {activeAgreement?.listing?.images?.[0]?.url && (
              <div className="relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 flex flex-col md:flex-row items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeAgreement.listing.images[0].url} alt={activeAgreement.listing.title} className="w-full md:w-36 h-24 rounded-lg object-cover shrink-0" />
                <div className="flex flex-col justify-center flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 text-zinc-900 dark:text-white font-semibold text-sm">
                    <span>{activeAgreement.listing.title}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Serviced executive apartment with backup power and security.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 flex flex-col">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Monthly Rent</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₦</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">
                    {activeAgreement?.listing?.price ? Number(activeAgreement.listing.price).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 flex flex-col">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Lease Start</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                  {activeAgreement?.startDate ? formatDate(activeAgreement.startDate) : '—'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 flex flex-col">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Lease End</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                  {activeAgreement?.endDate ? formatDate(activeAgreement.endDate) : '—'}
                </span>
              </div>
            </div>

            {activeAgreement?.startDate && activeAgreement?.endDate && (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-900 dark:text-white font-semibold">Lease Period Progress</span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-xs">{leaseProgress}% elapsed • {activeAgreementCount} agreement(s)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${leaseProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 dark:border-white/[0.06]">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Download Lease Agreement (PDF)
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Phone className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              Contact Facility Manager
            </button>
          </div>
        </div>

        {/* Next Payment Card */}
        <div className={`${card} lg:col-span-1 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Next Payment</h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs">
                <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {daysUntilRent} days left
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 flex flex-col">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Total Due Payable</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₦</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {activeAgreement?.listing?.price ? Number(activeAgreement.listing.price).toLocaleString() + '.00' : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link href="/dashboard/tenant/payments" className="w-full h-11 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pay Rent Now
            </Link>
            <div className="text-center">
              <Link href="/dashboard/tenant/payments" className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 hover:underline">
                View Breakdown &amp; Invoices
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Grid: Payment History + Maintenance */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment History */}
        <div className={`${card} lg:col-span-7 p-5 sm:p-6 flex flex-col`}>
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Payment History</h2>
            </div>
            <Link href="/dashboard/tenant/payments" className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline">
              All Payments
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-lg">Transaction</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06] text-sm text-zinc-900 dark:text-white">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-500 dark:text-zinc-400">No transactions yet.</td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-3 font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-white">{tx.type}</span>
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">{tx.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 text-xs">{formatDate(tx.createdAt)}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                        ₦{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className={`${card} lg:col-span-5 p-5 sm:p-6 flex flex-col`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Maintenance Requests</h2>
            </div>
            <Link href="/dashboard/tenant/maintenance/new" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Request
            </Link>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {tickets.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No maintenance requests.</p>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex flex-col gap-1.5 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-white text-sm">{t.title}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.status}</span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.category} • {t.priority}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
