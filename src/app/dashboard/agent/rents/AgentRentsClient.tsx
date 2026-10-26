'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Wallet,
  AlertTriangle,
  BadgeCheck,
  Search,
  Download,
  Eye,
  Receipt,
  Landmark,
  MapPin,
  Users,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Plus,
  Shield,
  RefreshCw,
} from 'lucide-react';
import {
  FinancePage,
  FinanceHeader,
  FinanceStatCard,
  FinanceProgress,
  FinanceStatus,
  FinanceFilterBar,
  FinanceSearch,
  FinanceSelect,
  FinanceTabs,
  FinanceEmptyState,
  FinanceButton,
  AGENT_FINANCE_LABEL,
  naira,
  nairaShort,
  formatDate,
  type FinanceStatusTone,
} from '@/components/financials/agent/AgentFinanceUI';
import type { AgentFinancePropertyCollection, AgentFinanceSummary } from '@/lib/agent-finance-data';

type Props = {
  summary: AgentFinanceSummary;
  collections: AgentFinancePropertyCollection[];
};

type ScopeFilter = 'all' | 'full' | 'collect';

export default function AgentRentsClient({ summary, collections }: Props) {
  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [scope, setScope] = useState<ScopeFilter>('all');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections.filter((c) => {
      const rate =
        c.expectedRent > 0 ? (c.collectedRent / c.expectedRent) * 100 : c.collectedRent > 0 ? 100 : 0;
      const cleared = rate >= 99;
      const arrears = c.arrearCount > 0;

      if (statusTab === 'cleared' && !cleared) return false;
      if (statusTab === 'impending' && (arrears || cleared)) return false;
      if (statusTab === 'arrears' && !arrears) return false;

      if (!q) return true;
      const haystack = [
        c.property.title,
        c.property.address ?? '',
        c.property.area ?? '',
        c.property.state ?? '',
        ...c.tenantNames,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [collections, query, statusTab]);

  const totalExpected = collections.reduce((s, c) => s + c.expectedRent, 0);
  const totalCollected = collections.reduce((s, c) => s + c.collectedRent, 0);
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
  const totalUnits = collections.reduce((s, c) => s + c.unitCount, 0);
  const occupiedUnits = collections.reduce((s, c) => s + c.occupiedUnitCount, 0);

  const clearedCount = collections.filter((c) => {
    const rate =
      c.expectedRent > 0 ? (c.collectedRent / c.expectedRent) * 100 : c.collectedRent > 0 ? 100 : 0;
    return rate >= 99;
  }).length;
  const arrearsCount = collections.filter((c) => c.arrearCount > 0).length;

  const exportCsv = () => {
    const header = [
      'Property',
      'Address',
      'Area',
      'State',
      'Units',
      'Tenants',
      'Expected Rent (NGN)',
      'Collected Rent (NGN)',
      'Collection Rate (%)',
      'Arrears (NGN)',
      'Last Collection',
    ];
    const body = collections.map((c) => {
      const rate =
        c.expectedRent > 0 ? (c.collectedRent / c.expectedRent) * 100 : c.collectedRent > 0 ? 100 : 0;
      return [
        c.property.title,
        c.property.address ?? '',
        c.property.area ?? '',
        c.property.state ?? '',
        String(c.unitCount),
        c.tenantNames.join(' | '),
        c.expectedRent.toFixed(2),
        c.collectedRent.toFixed(2),
        rate.toFixed(1),
        c.arrearAmount.toFixed(2),
        c.lastCollectionAt ? formatDate(c.lastCollectionAt) : '',
      ];
    });
    const csv = [header, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-rent-collections-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Agent Portal', 'Finance', 'Rent Collection']}
        title="Rent Collection & Inflows Hub"
        description="Institutional rent collection ledger, tenant arrears monitoring, and mandate-authorised escrow clearing for the properties under your management."
        badges={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Escrow Live
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {summary.propertyCount} managed properties
            </span>
          </div>
        }
        actions={
          <>
            <FinanceButton onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export Ledger (CSV/PDF)
            </FinanceButton>
            <FinanceButton variant="primary" onClick={() => setStatusTab('all')}>
              <Plus className="h-3.5 w-3.5" /> Record Direct Remittance
            </FinanceButton>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard
          label="Mandated Properties"
          value={`${collections.length} propert${collections.length === 1 ? 'y' : 'ies'}`}
          hint={`(${totalUnits} unit${totalUnits === 1 ? '' : 's'} · ${occupiedUnits} occupied)`}
          tone="primary"
          icon={<Building2 className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-xs dark:border-white/[0.08]">
              <span className="text-zinc-600 dark:text-zinc-400">
                {collections.filter((c) => c.agreementCount > 0).length} with live mandates
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          }
        />

        <FinanceStatCard
          label="Current Cycle Rent"
          value={naira(totalCollected)}
          tone="primary"
          icon={<Wallet className="h-4 w-4" />}
          footer={
            <div className="space-y-1.5 border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                <span>{collectionRate.toFixed(1)}% collected</span>
                <span className="font-mono">Target {nairaShort(totalExpected)}</span>
              </div>
              <FinanceProgress value={collectionRate} />
            </div>
          }
        />

        <FinanceStatCard
          label="Active Arrears & Deficits"
          value={naira(summary.arrearsTotal)}
          tone="red"
          icon={<AlertTriangle className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
                {summary.arrearsCount} item{summary.arrearsCount === 1 ? '' : 's'} flagged
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {arrearsCount} propert{arrearsCount === 1 ? 'y' : 'ies'}
              </span>
            </div>
          }
        />

        <FinanceStatCard
          label="Net Disbursed to Trust"
          value={naira(summary.totalInflows)}
          hint="Net of 5.0% agency + 2.5% management fee"
          tone="primary"
          icon={<BadgeCheck className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Across all mandates</span>
              <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          }
        />
      </div>

      {/* Filter toolbar */}
      <FinanceFilterBar className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FinanceSearch
          value={query}
          onChange={setQuery}
          placeholder="Filter property title, unit code, landlord, or tenant..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <FinanceTabs
            active={statusTab}
            onChange={setStatusTab}
            tabs={[
              { value: 'all', label: 'All Portfolios', count: collections.length },
              { value: 'cleared', label: 'Fully Cleared', count: clearedCount },
              { value: 'impending', label: 'Impending Due' },
              { value: 'arrears', label: 'Arrears Alert', count: arrearsCount },
            ]}
          />
          <FinanceSelect
            ariaLabel="Filter by mandate scope"
            value={scope}
            onChange={(v) => setScope(v as ScopeFilter)}
            options={[
              { value: 'all', label: 'Scope: All Mandates' },
              { value: 'full', label: 'Scope: Full Access Mandate' },
              { value: 'collect', label: 'Scope: Collect Rent Only' },
            ]}
            className="min-w-[190px]"
          />
        </div>
      </FinanceFilterBar>

      {/* Property portfolio cards */}
      {rows.length === 0 ? (
        <FinanceEmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No managed properties in this view"
          description={
            collections.length === 0
              ? 'Properties appear here once you are assigned an active mandate. Accept an invitation or ask a landlord to add you as an agent.'
              : 'No properties match the current filters. Clear the search or switch back to All Portfolios.'
          }
          action={
            collections.length === 0 ? (
              <Link
                href="/dashboard/agent/invites"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-xs font-medium text-white"
              >
                <Users className="h-3.5 w-3.5" /> View invitations
              </Link>
            ) : (
              <FinanceButton variant="primary" onClick={() => { setQuery(''); setStatusTab('all'); }}>
                <RefreshCw className="h-3.5 w-3.5" /> Reset filters
              </FinanceButton>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {rows.map((c) => {
            const rate =
              c.expectedRent > 0
                ? (c.collectedRent / c.expectedRent) * 100
                : c.collectedRent > 0
                  ? 100
                  : 0;
            const cleared = rate >= 99;
            const tone: FinanceStatusTone = c.arrearCount > 0 ? 'error' : cleared ? 'success' : 'pending';
            return (
              <div
                key={c.property.id}
                className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-900"
              >
                {c.arrearCount > 0 && (
                  <span className="absolute inset-y-0 left-0 w-1 bg-red-500" aria-hidden="true" />
                )}
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                  <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row">
                    <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-lg bg-zinc-100 md:h-28 md:w-44 dark:bg-zinc-800/50">
                      <Landmark className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <BadgeCheck className="h-3.5 w-3.5" /> Full Access Mandate
                        </span>
                        {c.property.state ? (
                          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
                            {c.property.state}
                          </span>
                        ) : null}
                        <FinanceStatus tone={tone}>
                          {cleared ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {c.arrearCount > 0
                            ? `${nairaShort(c.arrearAmount)} in arrears`
                            : cleared
                              ? '100% cleared'
                              : 'Collection in progress'}
                        </FinanceStatus>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                          {c.property.title}
                        </h3>
                        {c.property.address ? (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <MapPin className="h-3.5 w-3.5" /> {c.property.address}
                          </p>
                        ) : null}
                      </div>

                      {c.arrearCount > 0 && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-2.5 text-xs">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                          <div>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {c.arrearCount} rent schedule{c.arrearCount === 1 ? '' : 's'} overdue
                            </span>{' '}
                            <span className="text-zinc-700 dark:text-zinc-300">
                              — totalling {naira(c.arrearAmount)}. Statutory demand notices are queued by the
                              platform.
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
                          <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          {c.unitCount} unit{c.unitCount === 1 ? '' : 's'} ({c.occupiedUnitCount}/{c.unitCount} occupied)
                        </span>
                        {c.tenantNames.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400"
                          >
                            <Users className="h-3.5 w-3.5" /> {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Settlement box */}
                  <div className="w-full shrink-0 space-y-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50 xl:w-80">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <span>Annualised Ledger Yield</span>
                        <span className="font-mono">Current cycle</span>
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        {naira(c.expectedRent)}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span>Settled: {naira(c.collectedRent)}</span>
                        <span>{rate.toFixed(1)}%</span>
                      </div>
                      <FinanceProgress value={rate} className="mt-1.5" tone={c.arrearCount > 0 ? 'amber' : 'primary'} />
                      <p className="mt-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                        {c.lastCollectionAt
                          ? `Last collection: ${formatDate(c.lastCollectionAt)}`
                          : 'No collections recorded yet'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/dashboard/agent/properties/${c.property.id}`}
                          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                        >
                          <Eye className="h-3.5 w-3.5" /> Units ({c.unitCount})
                        </Link>
                        <Link
                          href={`/dashboard/agent/receipts?property=${encodeURIComponent(c.property.title)}`}
                          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                        >
                          <Receipt className="h-3.5 w-3.5" /> Receipts
                        </Link>
                      </div>
                      <Link
                        href="/dashboard/agent/receipts"
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500"
                      >
                        <Landmark className="h-3.5 w-3.5" /> Reconcile Payment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer summary strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            Portfolios:{' '}
            <span className="font-semibold text-zinc-900 dark:text-white">{collections.length}</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Expected:{' '}
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">{naira(totalExpected)}</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Collected:{' '}
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {naira(totalCollected)}
            </span>
          </span>
        </div>
        <Link
          href="/dashboard/agent/payments"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Open full payment ledger <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </FinancePage>
  );
}
