'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  MessageSquare,
  FileText,
  Eye,
  Download,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Building2,
  MapPin,
  Phone,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  idVerified: boolean;
  ninVerified: boolean;
  phoneVerified: boolean;
  agreementId: string;
  agreementStatus: string;
  startDate: Date | null;
  endDate: Date | null;
  rentAmount: number | null;
  property: { id: string; title: string; area: string; state: string } | null;
  unit: { id: string; buildingName: string | null; unitNumber: string; leaseStartDate: Date | null; leaseEndDate: Date | null } | null;
  latestInvoice: { status: string } | null;
}

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG');
}

function isExpiringSoon(tenant: Tenant) {
  if (!tenant.endDate) return false;
  const end = new Date(tenant.endDate).getTime();
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return end >= now && end - now <= thirtyDays;
}

function rentBadge(tenant: Tenant) {
  const s = tenant.latestInvoice?.status;
  if (!s) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]">
        No Record
      </span>
    );
  }
  switch (s) {
    case 'paid':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary dark:text-[#4edea3] border-primary/20">
          Paid
        </span>
      );
    case 'overdue':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-500 border-red-500/20">
          Overdue
        </span>
      );
    case 'sent':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
          Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]">
          {s.replace('_', ' ')}
        </span>
      );
  }
}

const STATUS_TABS = [
  { value: 'all', label: 'All Tenants' },
  { value: 'active', label: 'Active' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'delinquent', label: 'Delinquent' },
];

type SortKey = 'expiry' | 'status' | 'rent-high' | 'name';

export default function LandlordTenantsClient({ tenants }: { tenants: Tenant[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('expiry');

  const properties = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    for (const t of tenants) {
      if (t.property && !map.has(t.property.id)) {
        map.set(t.property.id, { id: t.property.id, label: `${t.property.title}, ${t.property.area}` });
      }
    }
    return Array.from(map.values());
  }, [tenants]);

  const filtered = useMemo(() => {
    let list = tenants.filter((t) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.agreementStatus === 'fully_signed' && !isExpiringSoon(t)) ||
        (statusFilter === 'expiring' && t.agreementStatus === 'fully_signed' && isExpiringSoon(t)) ||
        (statusFilter === 'delinquent' && t.latestInvoice?.status === 'overdue');

      const matchesProperty = propertyFilter === 'all' || t.property?.id === propertyFilter;

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.fullName.toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.phone || '').toLowerCase().includes(q) ||
        (t.unit?.unitNumber || '').toLowerCase().includes(q) ||
        (t.unit?.buildingName || '').toLowerCase().includes(q) ||
        (t.property?.title || '').toLowerCase().includes(q);

      return matchesStatus && matchesProperty && matchesSearch;
    });

    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'expiry': {
          const aTime = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          const bTime = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          return aTime - bTime;
        }
        case 'status': {
          const rank = (t: Tenant) => (t.latestInvoice?.status === 'overdue' ? 0 : t.latestInvoice?.status === 'sent' ? 1 : 2);
          return rank(a) - rank(b);
        }
        case 'rent-high':
          return (b.rentAmount || 0) - (a.rentAmount || 0);
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        default:
          return 0;
      }
    });

    return list;
  }, [tenants, statusFilter, propertyFilter, search, sortKey]);

  const stats = useMemo(() => {
    const active = tenants.filter((t) => t.agreementStatus === 'fully_signed').length;
    const expiring = tenants.filter((t) => t.agreementStatus === 'fully_signed' && isExpiringSoon(t)).length;
    const delinquent = tenants.filter((t) => t.latestInvoice?.status === 'overdue').length;
    const withInvoice = tenants.filter((t) => t.latestInvoice?.status).length;
    const paid = tenants.filter((t) => t.latestInvoice?.status === 'paid').length;
    const collectionRate = withInvoice > 0 ? (paid / withInvoice) * 100 : 100;
    return { total: tenants.length, active, expiring, delinquent, collectionRate };
  }, [tenants]);

  const tabCounts = useMemo(() => {
    return {
      all: tenants.length,
      active: tenants.filter((t) => t.agreementStatus === 'fully_signed' && !isExpiringSoon(t)).length,
      expiring: tenants.filter((t) => t.agreementStatus === 'fully_signed' && isExpiringSoon(t)).length,
      delinquent: tenants.filter((t) => t.latestInvoice?.status === 'overdue').length,
    };
  }, [tenants]);

  const handleExportCsv = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Property', 'Area', 'State', 'Unit', 'Lease Start', 'Lease End', 'Rent', 'Agreement Status', 'Rent Status', 'ID Verified', 'NIN Verified', 'Phone Verified'],
      ...filtered.map((t) => [
        t.fullName,
        t.email,
        t.phone || '',
        t.property?.title || '',
        t.property?.area || '',
        t.property?.state || '',
        t.unit ? `${t.unit.buildingName ? t.unit.buildingName + ' ' : ''}${t.unit.unitNumber}` : '',
        t.startDate ? new Date(t.startDate).toISOString().slice(0, 10) : '',
        t.endDate ? new Date(t.endDate).toISOString().slice(0, 10) : '',
        t.rentAmount != null ? String(t.rentAmount) : '',
        t.agreementStatus,
        t.latestInvoice?.status || '',
        String(t.idVerified),
        String(t.ninVerified),
        String(t.phoneVerified),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tenants.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <nav className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="hover:text-primary transition-colors cursor-pointer">Home</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Portfolio</span>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-zinc-900 dark:text-white font-semibold">Tenants</span>
          </nav>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Tenants</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {tenants.length} Lease{tenants.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Directory of tenants, lease terms, rent status, and statutory KYC badges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Link href="/dashboard/landlord/agreements">
            <Button className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-[var(--sovereign-hover)]">
              <Plus className="w-4 h-4" />
              <span>Add Tenant</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Total Active Tenants</span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {stats.total} <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tenants</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">{stats.active} active</span>
              <span className="text-zinc-500 dark:text-zinc-400">leases in force</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-40" />
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Lease Expiring Soon</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500/20 transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {stats.expiring} <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Leases</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">&lt; 30 days</span>
              <span className="text-zinc-500 dark:text-zinc-400">renewal required</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-transparent opacity-40" />
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Rent Collection Rate</span>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{stats.collectionRate.toFixed(1)}%</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">{stats.active}</span>
              <span>active leases tracked</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-40" />
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Delinquent / Overdue</span>
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-colors">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {stats.delinquent} <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Accounts</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-red-500">
              <span className="font-mono font-semibold">{stats.delinquent}</span>
              <span className="text-zinc-500 dark:text-zinc-400">pending recovery</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-transparent opacity-40" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant name, email, phone, building, or unit..."
            className="pl-9 bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label} ({tabCounts[tab.value as keyof typeof tabCounts]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-sm">
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort:</span>
          </div>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="h-9 w-44 bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expiry">Lease Expiry</SelectItem>
              <SelectItem value="status">Rent Status</SelectItem>
              <SelectItem value="rent-high">Rent: High to Low</SelectItem>
              <SelectItem value="name">Tenant Name</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="h-9 w-48 bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white">
              <Filter className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" />
              <SelectValue placeholder="Property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {tenants.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-zinc-400 opacity-60" />
            <p className="font-medium text-zinc-900 dark:text-white">No tenants found</p>
            <p className="text-sm mt-1 text-zinc-500 dark:text-zinc-400">Add tenants by creating an agreement.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-zinc-400 opacity-60" />
            <p className="font-medium text-zinc-900 dark:text-white">No tenants match filters</p>
            <p className="text-sm mt-1 text-zinc-500 dark:text-zinc-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 dark:bg-zinc-950/50">
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Tenant</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Phone / Comms</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Unit &amp; Building</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Property Location</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Lease Terms</TableHead>
                  <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Rent Status</TableHead>
                  <TableHead className="text-center text-zinc-500 dark:text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tenant) => {
                  const unitLabel = tenant.unit
                    ? `${tenant.unit.buildingName ? `${tenant.unit.buildingName} · ` : ''}${tenant.unit.unitNumber}`
                    : '—';
                  const leaseLabel =
                    tenant.startDate || tenant.endDate
                      ? `${formatDate(tenant.startDate)} → ${formatDate(tenant.endDate)}`
                      : '—';
                  return (
                    <TableRow key={tenant.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                            {tenant.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={tenant.avatarUrl} alt={tenant.fullName} className="w-full h-full object-cover" />
                            ) : (
                              tenant.fullName.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-zinc-900 dark:text-white text-sm font-medium truncate">{tenant.fullName}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{tenant.email}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {tenant.idVerified && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  ID Verified
                                </span>
                              )}
                              {tenant.ninVerified && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary dark:text-[#4edea3]">
                                  NIN Verified
                                </span>
                              )}
                              {tenant.phoneVerified && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                  Phone Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{tenant.phone || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-900 dark:text-white">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{unitLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>
                            {tenant.property
                              ? `${tenant.property.area}${tenant.property.state ? `, ${tenant.property.state}` : ''}`
                              : 'Unlinked'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{leaseLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{rentBadge(tenant)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/dashboard/landlord/messages?tenant=${tenant.id}`}>
                            <Button variant="ghost" size="sm" title="Message Tenant" className="text-zinc-600 dark:text-zinc-400 hover:text-primary">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </Link>
                          {tenant.agreementId && (
                            <Link href={`/dashboard/landlord/agreements/${tenant.agreementId}`}>
                              <Button variant="ghost" size="sm" title="View Agreement" className="text-zinc-600 dark:text-zinc-400 hover:text-primary">
                                <FileText className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/dashboard/landlord/tenants/${tenant.id}`}>
                            <Button variant="ghost" size="sm" title="View Profile" className="text-zinc-600 dark:text-zinc-400 hover:text-primary">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}