'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, Wrench, Home, Calendar, ArrowRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { StatCard, StatusBadge, PageHeader, Progress } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

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
  startDate?: string;
  endDate?: string;
}

interface Props {
  displayName: string;
  savedCount: number;
  activeAgreementCount: number;
  openMaintenanceCount: number;
  recentAgreements: Agreement[];
  recentTransactions: Transaction[];
  activeAgreement: ActiveAgreement | null;
}

export default function TenantDashboardClient({
  displayName,
  savedCount,
  activeAgreementCount,
  openMaintenanceCount,
  recentAgreements,
  recentTransactions,
  activeAgreement,
}: Props) {
  const [loading, setLoading] = useState(true);
  const greeting = displayName;

  // Calculate lease progress if we have an active agreement
  let leaseProgress = 0;
  let daysUntilRent = 8;
  if (activeAgreement?.startDate && activeAgreement?.endDate) {
    const start = new Date(activeAgreement.startDate);
    const end = new Date(activeAgreement.endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    leaseProgress = total > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))) : 0;
  }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-zinc-900 rounded animate-pulse" />
        <div className="h-40 w-full bg-zinc-900 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 w-full bg-zinc-900 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const paymentHistory = recentTransactions.slice(0, 4).map((tx) => ({
    month: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    amount: formatCurrency(Number(tx.amount)),
    date: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: tx.status,
  }));

  const maintenanceRequests = [
    { title: 'AC Not Cooling', status: 'In Progress', date: 'Aug 22', priority: 'High' },
    { title: 'Leaking Tap — Kitchen', status: 'Resolved', date: 'Aug 10', priority: 'Medium' },
    { title: 'Light Bulb — Bedroom', status: 'Resolved', date: 'Jul 28', priority: 'Low' },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Home"
        description={`Welcome back, ${greeting}. Here's what's happening with your tenancy.`}
        actions={
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/[0.08] text-zinc-300 text-sm rounded-lg hover:text-white hover:border-zinc-600 transition-colors"
          >
            <Home size={14} /> Browse Listings
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Days Until Rent" value={`${daysUntilRent}d`} sub="Sep 1, 2026" icon={Calendar} />
        <StatCard label="Lease Remaining" value="4 months" sub="Expires Dec 2026" icon={Home} />
        <StatCard label="Open Tickets" value={String(openMaintenanceCount)} sub="Maintenance" trend="flat" icon={Wrench} />
        <StatCard label="Saved Properties" value={String(savedCount)} sub="Browse more" icon={Home} />
      </div>

      {/* Current lease */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Current Lease</h3>
              <p className="text-zinc-500 text-sm mt-0.5">{activeAgreement?.listing?.address || 'No active lease'}</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              Active
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Monthly Rent', value: activeAgreement?.listing?.price ? formatCurrency(activeAgreement.listing.price) : '₦0' },
              { label: 'Lease Start', value: activeAgreement?.startDate ? new Date(activeAgreement.startDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
              { label: 'Lease End', value: activeAgreement?.endDate ? new Date(activeAgreement.endDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs text-zinc-600 mb-1">{item.label}</div>
                <div className="text-white text-sm font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-zinc-500">Lease Progress</span>
              <span className="text-white">{leaseProgress}% complete</span>
            </div>
            <Progress value={leaseProgress} color="#10b981" />
          </div>
        </div>

        {/* Next payment */}
        <div className="glass-card p-5 flex flex-col">
          <h3 className="text-white font-semibold text-sm mb-4">Next Payment</h3>
          <div className="flex-1">
            <div className="text-3xl font-black text-white mb-1">
              {activeAgreement?.listing?.price ? formatCurrency(activeAgreement.listing.price) : '₦0'}
            </div>
            <div className="text-zinc-500 text-xs mb-1">Due September 1, 2026</div>
            <div className={`flex items-center gap-1.5 text-xs ${daysUntilRent <= 7 ? 'text-amber-400' : 'text-zinc-500'}`}>
              <Clock size={11} />
              {daysUntilRent} days remaining
            </div>
          </div>
          <Link
            href="/dashboard/tenant/payments"
            className="mt-5 w-full py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-center flex items-center justify-center gap-2"
          >
            <CreditCard size={14} />
            Pay Rent
          </Link>
        </div>
      </div>

      {/* Payment history + maintenance */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Payment History</h3>
            <Link href="/dashboard/tenant/payments" className="text-xs text-emerald-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {paymentHistory.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No payment history yet.</p>
            ) : (
              paymentHistory.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{p.month}</div>
                    <div className="text-zinc-600 text-xs">Paid on {p.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-200 text-sm font-medium">{p.amount}</div>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Maintenance Requests</h3>
            <Link href="/dashboard/tenant/maintenance" className="text-xs text-emerald-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {maintenanceRequests.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/60">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  m.priority === 'High' ? 'bg-amber-400' : m.priority === 'Medium' ? 'bg-blue-400' : 'bg-zinc-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{m.title}</div>
                  <div className="text-zinc-600 text-xs">{m.date}</div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/tenant/maintenance/new"
            className="mt-3 w-full py-2 text-xs font-medium text-zinc-400 border border-dashed border-white/[0.08] rounded-lg hover:border-zinc-600 hover:text-zinc-200 transition-colors text-center block"
          >
            + New maintenance request
          </Link>
        </div>
      </div>
    </div>
  );
}
