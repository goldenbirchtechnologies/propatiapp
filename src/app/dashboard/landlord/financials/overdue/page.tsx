import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Clock,
  Scale,
  Search,
  Download,
  Bell,
  Gavel,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'Overdue Payments – Landlord',
  description: 'Track and manage overdue rent and service charge payments.',
};

export default async function LandlordOverduePaymentsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const overdueRent = await prisma.rentSchedule.findMany({
    where: { agreement: { landlordId: user.id }, status: 'overdue' },
    include: {
      agreement: {
        include: {
          tenant: { select: { fullName: true } },
          listing: { select: { title: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 50,
  });

  const overdueInvoices = await prisma.invoice.findMany({
    where: { agreement: { landlordId: user.id }, status: 'overdue' },
    include: {
      agreement: {
        include: {
          tenant: { select: { fullName: true } },
          listing: { select: { title: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 50,
  });

  const rows = [
    ...overdueRent.map((r) => ({
      id: r.id,
      tenant: r.agreement.tenant.fullName,
      unit: r.agreement.listing.title,
      amount: Number(r.amount),
      days: Math.max(1, Math.floor((Date.now() - new Date(r.dueDate).getTime()) / 86400000)),
      noticeSent: r.reminderSent > 0,
      type: 'Rent' as const,
      dueDate: r.dueDate,
    })),
    ...overdueInvoices.map((inv) => ({
      id: inv.id,
      tenant: inv.agreement.tenant.fullName,
      unit: inv.agreement.listing.title,
      amount: Number(inv.totalAmount || inv.amount || 0),
      days: inv.dueDate ? Math.max(1, Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000)) : 0,
      noticeSent: Boolean(inv.reminderSent),
      type: 'Invoice' as const,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '',
    })),
  ];

  const totalOverdue = rows.reduce((s, r) => s + r.amount, 0);
  const critical = rows.filter((r) => r.days >= 30);
  const early = rows.filter((r) => r.days < 30);
  const criticalAmt = critical.reduce((s, r) => s + r.amount, 0);
  const earlyAmt = early.reduce((s, r) => s + r.amount, 0);

  const fmt = (n: number) =>
    '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>Financials &amp; Payouts</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-zinc-900 dark:text-white font-semibold">Overdue Balances &amp; Statutory Recovery</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 mb-2">
                Statutory Enforcement Mode
              </span>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Overdue Payments</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Track delinquent institutional lease obligations, aged estate facility invoices, and trigger formal notices compliant with the Lagos State Tenancy Law (Cap L29).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm font-medium hover:bg-zinc-50 dark:hover:bg-white/[0.06] transition-colors border border-zinc-200 dark:border-white/[0.08]">
                <Bell className="w-4 h-4 text-red-500" />
                Send Bulk Reminders
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                <Gavel className="w-4 h-4" />
                Notice of Intent to Recover
              </button>
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Total Overdue Ledger</span>
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-red-600 font-mono">{fmt(totalOverdue)}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">{rows.length} Delinquent Accounts</span>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Critical Aged (≥ 30 Days)</span>
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-red-600 font-mono">{fmt(criticalAmt)}</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{critical.length} Accounts · 7-Day Statutory Threshold</div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Early Default (&lt; 30 Days)</span>
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-white/[0.08]">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{fmt(earlyAmt)}</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{early.length} Accounts Active · Automated SMS/Email</div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Legal Recovery Pipeline</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-emerald-600 font-mono">0 Cases</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Legal retainers pending activation</div>
              </div>
            </div>
          </div>

          {/* Main ledger */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="inline-flex p-1 bg-zinc-100 dark:bg-white/[0.04] rounded-lg border border-zinc-200 dark:border-white/[0.08]">
                <button className="px-4 py-2 rounded-md font-medium text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-white/[0.08]">
                  Rent Overdue ({rows.filter((r) => r.type === 'Rent').length})
                </button>
                <button className="px-4 py-2 rounded-md font-medium text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  Invoice &amp; Utility Overdue ({rows.filter((r) => r.type === 'Invoice').length})
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.06] transition-colors border border-zinc-200 dark:border-white/[0.08]">
                  Batch Recovery Action
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm rounded-lg hover:bg-zinc-50 dark:hover:bg-white/[0.06] transition-colors border border-zinc-200 dark:border-white/[0.08]">
                  <Download className="w-4 h-4" /> Court Audit Dossier
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-white/[0.04] rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 border border-zinc-200 dark:border-white/[0.08]"
                  placeholder="Search tenant entity, CAC/RC, or property suite..."
                />
              </div>
              <div className="md:col-span-4 flex items-center bg-zinc-50 dark:bg-white/[0.04] rounded-lg px-3 border border-zinc-200 dark:border-white/[0.08]">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase mr-2 shrink-0">Aging:</span>
                <select className="w-full bg-transparent text-sm text-zinc-900 dark:text-white py-2 focus:outline-none cursor-pointer">
                  <option value="all">All Delinquency Tiers</option>
                  <option value="early">&lt; 30 Days (Early Default)</option>
                  <option value="critical">30 – 60 Days (Critical 7-Day)</option>
                  <option value="statutory">&gt; 60 Days (Statutory Eviction)</option>
                </select>
              </div>
              <div className="md:col-span-3 flex items-center bg-zinc-50 dark:bg-white/[0.04] rounded-lg px-3 border border-zinc-200 dark:border-white/[0.08]">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase mr-2 shrink-0">Notice:</span>
                <select className="w-full bg-transparent text-sm text-zinc-900 dark:text-white py-2 focus:outline-none cursor-pointer">
                  <option value="all">All Statuses</option>
                  <option value="sent">Notice Served (Dispatched)</option>
                  <option value="pending">Pending Service</option>
                </select>
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-600 mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-emerald-600 font-medium">No overdue payments</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">All rent schedules and invoices are up to date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 dark:bg-white/[0.04] border-b border-zinc-200 dark:border-white/[0.08] text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-5 font-semibold">Tenant &amp; Corporate Entity</th>
                      <th className="py-3 px-5 font-semibold">Property / Institutional Unit</th>
                      <th className="py-3 px-5 font-semibold">Type</th>
                      <th className="py-3 px-5 font-semibold">Overdue Amount</th>
                      <th className="py-3 px-5 font-semibold">Days Overdue</th>
                      <th className="py-3 px-5 font-semibold">Notice Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-emerald-600/[0.04] transition-colors">
                        <td className="py-3 px-5 text-sm font-medium text-zinc-900 dark:text-white">{row.tenant}</td>
                        <td className="py-3 px-5 text-sm text-zinc-600 dark:text-zinc-400">{row.unit}</td>
                        <td className="py-3 px-5 text-sm">
                          <Badge variant="outline" className="border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04]">{row.type}</Badge>
                        </td>
                        <td className="py-3 px-5 text-sm font-medium text-red-600 font-mono">{fmt(row.amount)}</td>
                        <td className={`py-3 px-5 text-sm font-bold font-mono ${row.days >= 30 ? 'text-red-600' : 'text-amber-600'}`}>{row.days} days</td>
                        <td className="py-3 px-5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${row.noticeSent ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'}`}>
                            {row.noticeSent ? 'Sent' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
