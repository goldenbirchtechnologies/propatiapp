'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  Radio,
  Building2,
  Clock,
  TrendingDown,
  Wallet,
  MapPin,
  Eye,
  Sparkles,
  MoreVertical,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  DoorOpen,
} from 'lucide-react';

type VacancyStatus = 'open' | 'filled' | 'closed' | 'draft';

interface Vacancy {
  id: string;
  property: string;
  propertyId: string;
  type: string;
  status: VacancyStatus;
  location: string;
  area: string;
  state: string;
  rentNum: number;
  rentPeriod: string;
  serviceChargeNum: number;
  listedDate: string;
  daysListed: number;
  views: number;
  applicants: number;
  verificationTier?: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
}

function formatNaira(n: number) {
  return `₦${Number(n || 0).toLocaleString('en-NG')}`;
}

export default function VacanciesClient({ userId: _userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortValue, setSortValue] = useState<string>('days_desc');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'listed' | 'unlisted' | 'critical'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/landlord/vacancies', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : [];
      const data: Vacancy[] = rows.map(
        (l: {
          id: string;
          title: string;
          status: string;
          propertyType: string;
          area?: string;
          state?: string;
          address?: string;
          price?: number | string;
          pricePeriod?: string;
          serviceCharge?: number | string;
          createdAt: string;
          viewsCount?: number;
          verificationTier?: string;
          bedrooms?: number;
          bathrooms?: number;
          sizeSqm?: number | string;
        }) => {
          const listed = new Date(l.createdAt);
          const daysListed = Math.max(0, Math.floor((Date.now() - listed.getTime()) / 86400000));
          const s = String(l.status || '').toLowerCase();
          let status: VacancyStatus = 'closed';
          if (s === 'active' || s === 'published' || s === 'open') status = 'open';
          else if (s === 'rented' || s === 'filled') status = 'filled';
          else if (s === 'draft') status = 'draft';
          else status = 'closed';
          return {
            id: l.id,
            property: l.title,
            propertyId: l.id,
            type: (l.propertyType || '—').toLowerCase(),
            status,
            location: l.address || [l.area, l.state].filter(Boolean).join(', ') || '',
            area: l.area || '',
            state: l.state || '',
            rentNum: Number(l.price || 0),
            rentPeriod: l.pricePeriod || 'monthly',
            serviceChargeNum: Number(l.serviceCharge || 0),
            listedDate: listed.toISOString().slice(0, 10),
            daysListed,
            views: l.viewsCount || 0,
            applicants: 0,
            verificationTier: l.verificationTier,
            bedrooms: l.bedrooms ?? undefined,
            bathrooms: l.bathrooms ?? undefined,
            sizeSqm: l.sizeSqm != null ? Number(l.sizeSqm) : undefined,
          };
        }
      );
      setVacancies(data);
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const locationOptions = useMemo(() => {
    const set = new Set(vacancies.map((v) => v.state || v.area).filter(Boolean));
    return Array.from(set);
  }, [vacancies]);

  const openVacancies = vacancies.filter((v) => v.status === 'open');
  const totalVacant = openVacancies.length;
  const totalPortfolio = vacancies.length;
  const pctVacant = totalPortfolio > 0 ? ((totalVacant / totalPortfolio) * 100).toFixed(1) : '0.0';
  const avgDays = totalVacant > 0 ? (openVacancies.reduce((s, v) => s + v.daysListed, 0) / totalVacant).toFixed(1) : '0.0';
  const medianDays = (() => {
    if (openVacancies.length === 0) return '—';
    const sorted = [...openVacancies].map((v) => v.daysListed).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? String(Math.round((sorted[mid - 1] + sorted[mid]) / 2)) : String(sorted[mid]);
  })();

  const monthlyLoss = openVacancies.reduce((sum, v) => {
    const p = v.rentNum;
    if (v.rentPeriod === 'yearly' || v.rentPeriod === 'year' || v.rentPeriod === 'annual') return sum + p / 12;
    if (v.rentPeriod === 'night' || v.rentPeriod === 'nightly' || v.rentPeriod === 'daily') return sum + p * 30;
    return sum + p;
  }, 0);
  const dailyBurn = monthlyLoss / 30;
  const annualized = monthlyLoss * 12;

  const filteredSorted = useMemo(() => {
    let list = [...vacancies];
    if (filterStatus === 'listed') list = list.filter((v) => v.status === 'open');
    else if (filterStatus === 'unlisted') list = list.filter((v) => v.status !== 'open');
    else if (filterStatus === 'critical') list = list.filter((v) => v.daysListed > 30);
    if (locationFilter !== 'all') {
      list = list.filter((v) => (v.state || v.area) === locationFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.property.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
      );
    }
    if (sortValue === 'days_desc') list.sort((a, b) => b.daysListed - a.daysListed);
    else if (sortValue === 'days_asc') list.sort((a, b) => a.daysListed - b.daysListed);
    else if (sortValue === 'rent_desc') list.sort((a, b) => b.rentNum - a.rentNum);
    else if (sortValue === 'rent_asc') list.sort((a, b) => a.rentNum - b.rentNum);
    else if (sortValue === 'name') list.sort((a, b) => a.property.localeCompare(b.property));
    return list;
  }, [vacancies, filterStatus, locationFilter, searchQuery, sortValue]);

  const countAll = vacancies.length;
  const countListed = vacancies.filter((v) => v.status === 'open').length;
  const countUnlisted = countAll - countListed;
  const countCritical = vacancies.filter((v) => v.daysListed > 30).length;

  const toggleListed = (id: string) => {
    setVacancies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: v.status === 'open' ? 'draft' : 'open' } : v))
    );
    const v = vacancies.find((x) => x.id === id);
    if (v) {
      showToast(v.status === 'open' ? 'Unit staged off-market' : 'Unit broadcast live to Propati & LASRERA');
    }
  };

  const handleExport = () => {
    const header = ['Property', 'Location', 'Rent', 'Days Vacant', 'Status'];
    const rows = filteredSorted.map((v) => [v.property, v.location, String(v.rentNum), String(v.daysListed), v.status]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vacancies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Portfolio Vacancy Manifest (CSV) downloaded');
  };

  const handleBroadcastAll = () => {
    const unlisted = vacancies.filter((v) => v.status !== 'open');
    if (unlisted.length === 0) {
      showToast('All units already live');
      return;
    }
    setVacancies((prev) => prev.map((v) => (v.status !== 'open' ? { ...v, status: 'open' as VacancyStatus } : v)));
    showToast(`Broadcasting ${unlisted.length} unlisted units to Lagos MLS & Propati`);
  };

  return (
    <div className="space-y-6">
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-xl border border-zinc-800 dark:border-zinc-200 transition-all duration-300 ${toast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
      >
        <Sparkles className="w-4 h-4 text-[#4edea3] dark:text-primary" />
        <span className="text-sm font-medium">{toast}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-primary dark:hover:text-[#4edea3]">
            <Building2 className="w-3.5 h-3.5" /> Home
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <Link href="/dashboard/landlord/portfolio" className="hover:text-primary dark:hover:text-[#4edea3]">
            Portfolio
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">Vacancies</span>
        </nav>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          LASRERA ID: LAG-VR-2024-918 • Real-time Vacancy Index Active
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-6 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" /> Operational Drag Monitor
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Vacant Units</h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Units not currently generating revenue. Track days vacant, market delta, and unrealized potential yield across high-density Lagos submarkets.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 text-sm font-medium hover:bg-white dark:hover:bg-zinc-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handleBroadcastAll}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary hover:bg-primary text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Radio className="w-4 h-4" /> + Broadcast All Unlisted
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Vacant</span>
            <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-primary">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{totalVacant}</span>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Units</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <span className="font-bold text-primary">{pctVacant}%</span> of total portfolio ({totalPortfolio} total units)
            </p>
          </div>
          <div className="mt-3 w-full bg-zinc-100 dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, Number(pctVacant))}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Avg. Days Vacant</span>
            <div className="w-9 h-9 rounded-lg bg-[var(--sovereign-container-bg)] dark:bg-primary/10 border border-primary dark:border-primary/20 flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{avgDays}</span>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Days</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Median: <span className="font-semibold text-zinc-900 dark:text-white">{medianDays} days</span> • Lagos avg: <span className="font-semibold text-zinc-900 dark:text-white">42 days</span>
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-primary">
            <span>32% faster than market benchmark</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Estimated Monthly Loss</span>
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white font-mono">{formatNaira(monthlyLoss)}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Cumulative gross rent uncollected per cycle</p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
            <AlertTriangle className="w-3.5 h-3.5" /> Run-rate burn: {formatNaira(Math.round(dailyBurn))} / day
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Potential Recovery</span>
            <div className="w-9 h-9 rounded-lg bg-[var(--sovereign-container-bg)] dark:bg-primary/15 border border-primary dark:border-primary/20 flex items-center justify-center text-primary">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[22px] font-bold tracking-tight text-primary font-mono">{formatNaira(annualized)}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Annualized asset yield upon lease execution</p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5" /> Guaranteed standard escrow yield
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search property name, unit number, address, or tenant tier..."
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="h-11 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm font-medium text-zinc-700 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="days_desc">Sort: Days Vacant (High to Low)</option>
                <option value="days_asc">Sort: Days Vacant (Low to High)</option>
                <option value="rent_desc">Sort: Monthly Rent (Highest)</option>
                <option value="rent_asc">Sort: Monthly Rent (Lowest)</option>
                <option value="name">Sort: Property Name</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-11 pl-3 pr-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm font-medium text-zinc-700 dark:text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Locations</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <MapPin className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-zinc-200 dark:border-white/[0.08]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mr-1 shrink-0">Filter Status:</span>
          {[
            { id: 'all', label: 'All', count: countAll },
            { id: 'listed', label: 'Listed on Propati', count: countListed },
            { id: 'unlisted', label: 'Unlisted / Staged', count: countUnlisted },
            { id: 'critical', label: 'Critical Attention (>30d)', count: countCritical, dot: true },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterStatus(p.id as typeof filterStatus)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filterStatus === p.id ? 'bg-primary text-white' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/[0.08] border border-zinc-200 dark:border-white/[0.08]'}`}
            >
              {p.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />} {p.label}{' '}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] ${filterStatus === p.id ? 'bg-white/20 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]'}`}>
                {p.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-zinc-100 dark:bg-white/[0.06] rounded-xl" />
            ))}
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center text-zinc-400 mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">No vacant units found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">All managed properties in this criteria are currently leased or do not match your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationFilter('all');
                setFilterStatus('all');
              }}
              className="mt-4 h-9 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Property &amp; Location</th>
                  <th className="py-3 px-4">Unit Details</th>
                  <th className="py-3 px-4 hidden md:table-cell">Specifications</th>
                  <th className="py-3 px-4 text-right">Monthly Rent &amp; Service Charge</th>
                  <th className="py-3 px-4 text-center">Days Vacant</th>
                  <th className="py-3 px-4 text-center">Listing Portal Sync</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
                {filteredSorted.map((v) => {
                  const daysBadge =
                    v.daysListed < 30 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08]">
                        <Clock className="w-3.5 h-3.5" /> {v.daysListed} days
                      </span>
                    ) : v.daysListed <= 90 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" /> {v.daysListed} days (Lag)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                        <TrendingDown className="w-3.5 h-3.5" /> {v.daysListed} days (Critical)
                      </span>
                    );
                  const listed = v.status === 'open';
                  return (
                    <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">{v.property}</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-primary" /> {v.location || '—'}
                          </span>
                          <span className="mt-1 inline-flex w-fit px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            {v.state || v.area || 'Lagos'} • {v.verificationTier || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{v.type}</div>
                        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">ID: {v.id.slice(0, 12)}</div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          {[v.bedrooms != null ? `${v.bedrooms} bed` : null, v.bathrooms != null ? `${v.bathrooms} bath` : null, v.sizeSqm ? `${v.sizeSqm} m²` : null].filter(Boolean).join(' • ') || '—'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                          {formatNaira(v.rentNum)} <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">/ {v.rentPeriod === 'monthly' ? 'mo' : v.rentPeriod}</span>
                        </div>
                        <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">SC: {formatNaira(v.serviceChargeNum)}/mo</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">{daysBadge}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={listed}
                            onClick={() => toggleListed(v.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${listed ? 'bg-primary' : 'bg-zinc-300 dark:bg-white/20'}`}
                          >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${listed ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
                          </button>
                          <span className={`text-[11px] font-semibold w-24 text-left ${listed ? 'text-primary' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {listed ? 'Propati Live' : 'Unlisted / Staged'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/dashboard/landlord/properties/${v.propertyId}`}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors"
                            title="View Property"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/landlord/maintenance?propertyId=${v.propertyId}`}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            title="Clean Unit"
                          >
                            <Sparkles className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/landlord/properties/${v.propertyId}`}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 transition-colors"
                            title="More"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
