'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  PageHeader,
  StatCard,
  StatusBadge,
  SearchInput,
} from '@/components/ui';
import {
  Phone,
  Calendar,
  CheckCircle2,
  Ban,
  Download,
  Plus,
  Clock,
  Eye,
} from 'lucide-react';

type Screening = {
  id: string;
  tenant: string;
  property: string;
  date: string;
  status: string;
  notes: string;
};

const STATUS_FILTERS = ['all', 'scheduled', 'completed', 'cancelled', 'no_show'] as const;
type FilterKey = (typeof STATUS_FILTERS)[number];

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export default function LandlordScreeningClient({
  initialScreenings,
}: {
  initialScreenings: Screening[];
}) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: initialScreenings.length };
    for (const k of STATUS_FILTERS) {
      if (k !== 'all') c[k] = initialScreenings.filter((s) => s.status === k).length;
    }
    return c;
  }, [initialScreenings]);

  const filtered = useMemo(() => {
    let list = initialScreenings;
    if (filter !== 'all') list = list.filter((s) => s.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.tenant.toLowerCase().includes(q) ||
          s.property.toLowerCase().includes(q) ||
          s.notes.toLowerCase().includes(q),
      );
    }
    return list;
  }, [initialScreenings, filter, query]);

  const upcoming = counts.scheduled ?? 0;
  const completed = counts.completed ?? 0;
  const cancelled = (counts.cancelled ?? 0) + (counts.no_show ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Screening Calls"
        description="Manage prospective tenant vetting interviews, compliance calls, and legal dossier checks."
        breadcrumb={['Home', 'Portfolio', 'Screening', 'Calls']}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-[#1a1a1e] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              type="button"
              className="h-10 px-4 rounded-lg bg-primary hover:bg-[var(--sovereign-hover)] text-white transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Screening Call</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Upcoming Screenings"
          value={upcoming}
          sub="Scheduled"
          icon={Calendar}
          accentColor="#006c49"
          trendValue={upcoming > 0 ? 'Next pending' : 'None pending'}
        />
        <StatCard
          label="Completed Interviews"
          value={completed}
          sub="Vetted"
          icon={CheckCircle2}
          accentColor="#006c49"
          trendValue="88% progression rate"
        />
        <StatCard
          label="Cancelled / Rescheduled"
          value={cancelled}
          sub="Archived"
          icon={Ban}
          accentColor="#71717a"
          trendValue="Awaiting tenant reschedule link"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <SearchInput
            value={query}
            onChange={(v) => setQuery(v)}
            placeholder="Search tenant name, listing address, or slot..."
          />
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#1a1a1e] p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
                filter === f
                  ? 'bg-white dark:bg-[#27272a] text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white',
              )}
            >
              {f === 'all' ? 'All Calls' : STATUS_LABEL[f]}{' '}
              <span className="ml-1 text-xs font-mono">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-[#1a1a1e] rounded-lg text-sm text-zinc-700 dark:text-zinc-300 shrink-0">
          <Clock className="h-4 w-4 text-zinc-500" />
          <span>{new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="w-16 h-16 mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
              No Screening Calls Found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              There are no tenant verification or compliance interviews matching your current
              filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-[#18181b] text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-5 font-semibold">Candidate Dossier</th>
                  <th className="py-3 px-4 font-semibold">Target Asset / Listing</th>
                  <th className="py-3 px-4 font-semibold">Scheduled Window (WAT)</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Channel &amp; Room</th>
                  <th className="py-3 px-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-[#27272a]">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-zinc-50 dark:hover:bg-[#18181b] transition-colors"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary dark:text-[#4edea3] flex items-center justify-center text-xs font-bold">
                          {s.tenant
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {s.tenant}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">RC —</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">{s.property}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">—</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                      {new Date(s.date).toLocaleString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={STATUS_LABEL[s.status] ?? s.status} />
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs">
                      Sovereign Secure Video
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href="#"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-primary dark:text-[#4edea3] hover:bg-primary/10 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
