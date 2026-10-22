'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Plus,
  TrendingUp,
  CalendarClock,
  AlertTriangle,
  Gavel,
  BadgeCheck,
  Eye,
  Send,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Lease {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    city: string | null;
  };
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    kycVerified: boolean;
  };
  unit: { buildingName: string | null; unitNumber: string } | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  rentAmount: number | null;
  rentPeriod: string | null;
  cautionDeposit: number | null;
  noticePeriodDays: number;
  createdAt: Date;
  latestInvoice: { status: string | null } | null;
  stampStatus: string | null;
}

export interface StampHealth {
  certified: number;
  inProgress: number;
}

export interface Occupancy {
  totalUnits: number;
  occupiedUnits: number;
  rate: number;
}

interface Props {
  leases: Lease[];
  stampHealth: StampHealth;
  escrowDeposits: number;
  occupancy: Occupancy;
  monthStart: string;
}

const PAGE_SIZE = 10;

const PENDING_STATUSES = ['draft', 'pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'];

function formatCurrency(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `₦${Number(value).toLocaleString()}`;
}

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(date: Date | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.floor(diff / 86400000);
}

function titleCase(value: string) {
  return value
    .split(/[_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

function periodLabel(period: string | null) {
  if (!period) return 'Per Annum';
  return period === 'yearly' ? 'Per Annum' : period === 'monthly' ? 'Per Month' : titleCase(period);
}

function statusBadge(lease: Lease) {
  if (lease.status === 'fully_signed') {
    return (
      <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
        Active Lease
      </Badge>
    );
  }
  if (PENDING_STATUSES.includes(lease.status)) {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
        Pending Signature
      </Badge>
    );
  }
  if (lease.status === 'expired') {
    return (
      <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
        Expired
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/20">
      {titleCase(lease.status)}
    </Badge>
  );
}

export default function LandlordLeasesClient({
  leases,
  stampHealth,
  escrowDeposits,
  occupancy,
  monthStart,
}: Props) {
  const [tab, setTab] = useState('all');
  const [propertyId, setPropertyId] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const monthStartDate = useMemo(() => new Date(monthStart), [monthStart]);

  const stats = useMemo(() => {
    const now = Date.now();
    const active = leases.filter((l) => l.status === 'fully_signed');
    const expiringSoon = active.filter((l) => {
      if (!l.endDate) return false;
      const days = (new Date(l.endDate).getTime() - now) / 86400000;
      return days >= 0 && days <= 30;
    });
    const expired = leases.filter(
      (l) => l.status === 'expired' || l.status === 'terminated' || (l.endDate ? new Date(l.endDate).getTime() < now : false),
    );
    const addedThisMonth = leases.filter((l) => new Date(l.createdAt) >= monthStartDate).length;
    return {
      total: leases.length,
      active: active.length,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
      addedThisMonth,
    };
  }, [leases, monthStartDate]);

  const properties = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of leases) {
      if (!map.has(l.property.id)) map.set(l.property.id, l.property.title);
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [leases]);

  const tabCounts = useMemo(
    () => ({
      all: leases.length,
      active: leases.filter((l) => l.status === 'fully_signed').length,
      expiring: leases.filter((l) => {
        if (l.status !== 'fully_signed' || !l.endDate) return false;
        const days = (new Date(l.endDate).getTime() - Date.now()) / 86400000;
        return days >= 0 && days <= 30;
      }).length,
      pending: leases.filter((l) => PENDING_STATUSES.includes(l.status)).length,
      expired: leases.filter(
        (l) =>
          l.status === 'expired' ||
          l.status === 'terminated' ||
          (l.endDate ? new Date(l.endDate).getTime() < Date.now() : false),
      ).length,
    }),
    [leases],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leases.filter((l) => {
      if (propertyId !== 'all' && l.property.id !== propertyId) return false;

      switch (tab) {
        case 'active':
          if (l.status !== 'fully_signed') return false;
          break;
        case 'expiring': {
          if (l.status !== 'fully_signed' || !l.endDate) return false;
          const days = (new Date(l.endDate).getTime() - Date.now()) / 86400000;
          if (days < 0 || days > 30) return false;
          break;
        }
        case 'pending':
          if (!PENDING_STATUSES.includes(l.status)) return false;
          break;
        case 'expired':
          if (
            l.status !== 'expired' &&
            l.status !== 'terminated' &&
            !(l.endDate && new Date(l.endDate).getTime() < Date.now())
          )
            return false;
          break;
      }

      if (!q) return true;
      const haystack = [
        l.tenant.fullName,
        l.tenant.email,
        l.tenant.phone || '',
        l.property.title,
        l.property.area,
        l.property.state,
        l.unit?.buildingName || '',
        l.unit?.unitNumber || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [leases, tab, propertyId, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stampPct = leases.length > 0 ? Math.round((stampHealth.certified / leases.length) * 100) : 0;

  const exportCsv = () => {
    const header = [
      'Property',
      'Unit',
      'Location',
      'Tenant',
      'Email',
      'Phone',
      'Status',
      'Commencement',
      'Expiry',
      'Days Left',
      'Rent',
      'Period',
      'Invoice Status',
      'Stamp Duty',
    ];
    const rows = filtered.map((l) => {
      const days = daysUntil(l.endDate);
      return [
        l.property.title,
        l.unit ? `${l.unit.buildingName || ''} ${l.unit.unitNumber}`.trim() : '',
        `${l.property.area}, ${l.property.state}`,
        l.tenant.fullName,
        l.tenant.email,
        l.tenant.phone || '',
        l.status,
        l.startDate ? formatDate(l.startDate) : '',
        l.endDate ? formatDate(l.endDate) : '',
        days === null ? '' : String(days),
        l.rentAmount ? String(l.rentAmount) : '',
        l.rentPeriod || '',
        l.latestInvoice?.status || '',
        l.stampStatus || '',
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(',');
    });
    const csv = [header.map((h) => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leases-agreements.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { value: 'all', label: 'All', count: tabCounts.all },
    { value: 'active', label: 'Active', count: tabCounts.active },
    { value: 'expiring', label: 'Expiring Soon', count: tabCounts.expiring },
    { value: 'pending', label: 'Pending Sig', count: tabCounts.pending },
    { value: 'expired', label: 'Expired', count: tabCounts.expired },
  ];

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#09090b] min-h-screen p-4 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              FY 2024–2025 Ledger
            </span>
            <span className="text-zinc-400 text-xs">•</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Legal Covenants</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">Leases &amp; Agreements</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Overview of legal covenants, tenure expirations, stamp-duty verifications, and tenant payment liabilities
            across Lagos asset clusters.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start xl:self-center">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 bg-white dark:bg-[#18181b] text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg text-sm font-medium border border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <Link
            href="/dashboard/landlord/agreements/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>Create Agreement</span>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] p-5 shadow-none">
          <div className="flex items-start justify-between">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium uppercase tracking-wider">Total Leases</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-zinc-200 dark:border-white/[0.08]">
              <FileText size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{stats.total}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={12} />
              {stats.total - stats.addedThisMonth > 0 ? `${stats.total - stats.addedThisMonth} Executed` : 'Executed'}
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              +{stats.addedThisMonth} added this month
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] p-5 shadow-none">
          <div className="flex items-start justify-between">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium uppercase tracking-wider">
              Active &amp; Performing
            </p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-zinc-200 dark:border-white/[0.08]">
              <BadgeCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Units</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {occupancy.rate.toFixed(1)}% occupancy rate
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] p-5 shadow-none">
          <div className="flex items-start justify-between">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium uppercase tracking-wider">
              Expiring &lt; 30 Days
            </p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 border border-zinc-200 dark:border-white/[0.08]">
              <CalendarClock size={15} className="text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1 text-amber-500">{stats.expiringSoon}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tenancies</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Renewals pending notice</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] p-5 shadow-none">
          <div className="flex items-start justify-between">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium uppercase tracking-wider">
              Expired / Delinquent
            </p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-zinc-200 dark:border-white/[0.08]">
              <Gavel size={15} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1 text-red-500">{stats.expired}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Overdue</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Quit notice stage active</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] p-4 shadow-none">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTab(t.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  tab === t.value
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search tenant, unit, property..."
                className="pl-9 w-full sm:w-64 bg-white dark:bg-[#09090b] border-zinc-200 dark:border-white/[0.08]"
              />
            </div>
            <Select
              value={propertyId}
              onValueChange={(v) => {
                setPropertyId(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-56 bg-white dark:bg-[#09090b] border-zinc-200 dark:border-white/[0.08]">
                <Building2 className="size-4 text-zinc-400" />
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties (Lagos)</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] shadow-none">
        {leases.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-600 opacity-60" />
            <p className="font-medium text-zinc-900 dark:text-white">No Leases Found</p>
            <p className="text-sm mt-1 text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              There are currently no active or pending agreements matching this criteria. Create a tenancy agreement to
              generate legal compliance schedules.
            </p>
            <Link
              href="/dashboard/landlord/agreements/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Create First Lease Agreement
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-600 opacity-60" />
            <p className="font-medium text-zinc-900 dark:text-white">No Leases Found</p>
            <p className="text-sm mt-1 text-zinc-600 dark:text-zinc-400">
              There are currently no active or pending agreements matching this criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/[0.08]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">Property &amp; Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">Tenant Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">Commencement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400">Expiry &amp; Horizon</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">Rent Liability</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((lease) => {
                  const days = daysUntil(lease.endDate);
                  const invoiceStatus = lease.latestInvoice?.status;
                  return (
                    <tr
                      key={lease.id}
                      className="border-b border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                            <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              {lease.property.title}
                              {lease.unit ? ` ${lease.unit.unitNumber}` : ''}
                            </p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {lease.unit?.buildingName ? `${lease.unit.buildingName} · ` : ''}
                              {lease.property.area}
                              {lease.property.state ? `, ${lease.property.state}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{lease.tenant.fullName}</p>
                            {lease.tenant.kycVerified && (
                              <Badge
                                variant="success"
                                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
                              >
                                <BadgeCheck size={10} />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{lease.tenant.email}</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{lease.tenant.phone || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{statusBadge(lease)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{formatDate(lease.startDate)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-zinc-900 dark:text-white">{formatDate(lease.endDate)}</p>
                        {days !== null && (
                          <p
                            className={`text-xs mt-0.5 ${
                              days < 0
                                ? 'text-red-500'
                                : days <= 30
                                  ? 'text-amber-500'
                                  : 'text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            {days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days} days left`}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white font-mono">
                          {formatCurrency(lease.rentAmount)}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                          {periodLabel(lease.rentPeriod)}
                          {invoiceStatus ? ` · ${titleCase(invoiceStatus)}` : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/landlord/agreements/${lease.id}`}
                            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
                            title="View Agreement"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/dashboard/landlord/messages?tenant=${lease.tenant.id}`}
                            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
                            title="Send Notice"
                          >
                            <Send size={16} />
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

        {/* Pagination */}
        {leases.length > 0 && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-200 dark:border-white/[0.08]">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Showing {((safePage - 1) * PAGE_SIZE) + 1} - {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} total registered institutional covenants
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage === pageCount}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] p-5 shadow-none">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-white/[0.08]">
              <BadgeCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">FIRS / LIRS Stamp Duty Health</p>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {stampPct}% Certified
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {stampHealth.certified} of {leases.length} leases carry authenticated Lagos State e-stamps with verifiable
                QR barcodes registered with the Lands Registry.
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300">
                    {stampHealth.certified} Compliant Leases
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300">
                    {stampHealth.inProgress} Stamp In-Progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#18181b] p-5 shadow-none">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-white/[0.08]">
              <FileText size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Escrow Deposits Held</p>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {formatCurrency(escrowDeposits)}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                In Yield-bearing Vault — Protected against dilapidations, utility arrears, and diesel maintenance
                surcharges under custody account 1018841-ZEN.
              </p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-3">
                Lagos State Tenancy Law Compliant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
