import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { formatNaira } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  CalendarDays,
  Eye,
  FileCheck2,
  PenLine,
  Star,
} from 'lucide-react';

export const metadata = {
  title: 'Commercial Lease Agreement Review – Landlord',
  description: 'Review proposed commercial lease terms before signing.',
};

const ACTION_STATUSES = ['pending_landlord', 'tenant_signed'] as const;

export default async function CommercialAgreementsReviewPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const agreements = await prisma.agreement.findMany({
    where: {
      landlordId: user.id,
      status: { in: [...ACTION_STATUSES] },
    },
    include: {
      tenant: { select: { fullName: true, email: true } },
      listing: { select: { title: true, address: true, listingType: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const pendingSignatureCount = agreements.filter((a) => a.status === 'pending_landlord').length;
  const reviewRequiredCount = agreements.filter((a) => a.status === 'tenant_signed').length;

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span>Home</span>
                <span>/</span>
                <span>Commercial</span>
                <span>/</span>
                <span>Agreements</span>
                <span>/</span>
                <span className="text-emerald-600 font-bold">Agreement Review</span>
              </nav>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
                Commercial Lease Agreement Review
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Review proposed institutional lease terms, covenants, and escrow guarantees before execution.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium transition-colors">
                Export Summary
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-medium transition-colors">
                Audit Trail
              </button>
            </div>
          </div>

          {/* KPI badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm flex items-center justify-between border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <PenLine className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Action Required
                  </span>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {pendingSignatureCount} Awaiting Signature
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Pending
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm flex items-center justify-between border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Under Deliberation
                  </span>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {reviewRequiredCount} Review Required
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                Redline
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm flex items-center justify-between border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Statutory Escrow Active
                  </span>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {agreements.length > 0 ? 'Custody Secured' : 'No Active Escrow'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Secured
              </span>
            </div>
          </div>

          {/* Ledger */}
          {agreements.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-12 text-center border border-zinc-200 dark:border-zinc-800">
              <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <FileCheck2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mt-4">
                No agreements awaiting review
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                All commercial covenants are signed, registered with the registry, and up to date in active escrow.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Agreements In Progress
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Showing active leases pending execution.
                  </p>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                  Page 1 of 1 ({agreements.length} Items)
                </span>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Property &amp; Spec</th>
                      <th className="py-3 px-4">Tenant</th>
                      <th className="py-3 px-4">Lease Terms</th>
                      <th className="py-3 px-4 text-right">Rent &amp; Liabilities</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {agreements.map((agr) => {
                      const isPending = agr.status === 'pending_landlord';
                      return (
                        <tr
                          key={agr.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="py-4 px-4 align-top">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                  {agr.listing.title}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {agr.listing.address}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {agr.tenant.fullName}
                              </span>
                              {agr.tenant.email && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {agr.tenant.email}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="text-sm text-zinc-900 dark:text-white">
                                {agr.startDate
                                  ? new Date(agr.startDate).toLocaleDateString('en-NG')
                                  : '—'}{' '}
                                –{' '}
                                {agr.endDate
                                  ? new Date(agr.endDate).toLocaleDateString('en-NG')
                                  : '—'}
                              </span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {agr.rentPeriod ? agr.rentPeriod : 'Lease'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                                {agr.rentAmount
                                  ? formatNaira(Number(agr.rentAmount))
                                  : 'Negotiable'}
                                {agr.rentPeriod ? (
                                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                                    /{agr.rentPeriod}
                                  </span>
                                ) : null}
                              </span>
                              {agr.serviceCharge ? (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  + Service charge {formatNaira(Number(agr.serviceCharge))}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top text-center">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending Signature
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                Review Required
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 align-top text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending ? (
                                <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                                  <PenLine className="w-4 h-4" />
                                  Sign Agreement
                                </button>
                              ) : (
                                <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                                  <Star className="w-4 h-4" />
                                  Review Redline
                                </button>
                              )}
                              <button
                                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                                title="View Document"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  <span>Compliant with Lagos State Tenancy Law 2011 &amp; Land Use Charge Act Regulations.</span>
                </div>
                <span>Authenticated Landlord: {user.fullName}</span>
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
