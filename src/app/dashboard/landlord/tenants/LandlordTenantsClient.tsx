'use client';

import { useState, useMemo } from 'react';
import { Users, Search, Filter, MessageSquare, FileText, Eye } from 'lucide-react';
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
import Link from 'next/link';

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

function rentBadge(tenant: Tenant) {
  const s = tenant.latestInvoice?.status;
  if (!s) return <Badge variant="outline" className="bg-muted/30 text-zinc-500 border border-white/[0.08]">No Record</Badge>;
  switch (s) {
    case 'paid':
      return <Badge variant="default" className="bg-success/10 text-[#00ff66] border border-white/[0.08]">Paid</Badge>;
    case 'overdue':
      return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border border-white/[0.08]">Overdue</Badge>;
    case 'sent':
      return <Badge variant="secondary" className="bg-warning/10 text-warning border border-white/[0.08]">Pending</Badge>;
    default:
      return <Badge variant="outline" className="bg-muted/30 text-zinc-500 border border-white/[0.08]">{s.replace('_', ' ')}</Badge>;
  }
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Moved Out' },
];

export default function LandlordTenantsClient({ tenants }: { tenants: Tenant[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const properties = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    for (const t of tenants) {
      if (t.property && !map.has(t.property.id)) {
        map.set(t.property.id, { id: t.property.id, label: `${t.property.title}, ${t.property.area}` });
      }
    }
    return Array.from(map.values());
  }, [tenants]);

  const [propertyFilter, setPropertyFilter] = useState('all');

  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.agreementStatus === 'fully_signed') ||
        (statusFilter === 'pending' && ['draft','pending_landlord','pending_tenant','tenant_signed','landlord_signed'].includes(t.agreementStatus)) ||
        (statusFilter === 'expired' && ['terminated','expired'].includes(t.agreementStatus));

      const matchesProperty = propertyFilter === 'all' || t.property?.id === propertyFilter;

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.fullName.toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.phone || '').toLowerCase().includes(q) ||
        (t.unit?.unitNumber || '').toLowerCase().includes(q) ||
        (t.unit?.buildingName || '').toLowerCase().includes(q);

      return matchesStatus && matchesProperty && matchesSearch;
    });
  }, [tenants, statusFilter, propertyFilter, search]);

  const stats = useMemo(() => {
    const active = tenants.filter((t) => t.agreementStatus === 'fully_signed').length;
    const pending = tenants.filter((t) => ['draft','pending_landlord','pending_tenant','tenant_signed','landlord_signed'].includes(t.agreementStatus)).length;
    const expired = tenants.filter((t) => ['terminated','expired'].includes(t.agreementStatus)).length;
    return { total: tenants.length, active, pending, expired };
  }, [tenants]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tenants</h1>
          <p className="text-zinc-500 mt-1">Manage tenant operations and occupancy</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 p-5 shadow-none">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold mt-1 text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 p-5 shadow-none">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold mt-1 text-[#00ff66]">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 p-5 shadow-none">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold mt-1 text-warning">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 p-5 shadow-none">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Moved Out</p>
          <p className="text-2xl font-bold mt-1 text-red-500">{stats.expired}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 p-4 shadow-none">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Search by name, email, phone, or unit..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2 text-zinc-500" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-full sm:w-64">
              <Filter className="w-4 h-4 mr-2 text-zinc-500" />
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

      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 shadow-none">
        {tenants.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-zinc-500 opacity-60" />
            <p className="font-medium text-white">No tenants found</p>
            <p className="text-sm mt-1 text-zinc-500">Add tenants by creating an agreement.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-zinc-500 opacity-60" />
            <p className="font-medium text-white">No tenants match filters</p>
            <p className="text-sm mt-1 text-zinc-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property & Unit</TableHead>
                  <TableHead>Lease Term</TableHead>
                  <TableHead>Rent Status</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tenant) => {
                  const unitLabel = tenant.unit
                    ? `${tenant.unit.buildingName ? `${tenant.unit.buildingName} · ` : ''}${tenant.unit.unitNumber}`
                    : '—';
                  const leaseLabel = tenant.startDate || tenant.endDate
                    ? `${formatDate(tenant.startDate)} → ${formatDate(tenant.endDate)}`
                    : '—';
                  return (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                            {tenant.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm">{tenant.fullName}</p>
                            <p className="text-xs text-zinc-500">{tenant.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white text-sm">{tenant.property?.title || 'Unlinked'}</p>
                          <p className="text-xs text-zinc-500">
                            {tenant.property?.area}{tenant.property?.state ? `, ${tenant.property.state}` : ''} · {unitLabel}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">{leaseLabel}</TableCell>
                      <TableCell>{rentBadge(tenant)}</TableCell>
                      <TableCell>
                        {tenant.idVerified || tenant.ninVerified ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-success/10 text-[#00ff66] border-success/20">Verified</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-muted/30 text-zinc-500 border-white/[0.08]">Unverified</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/landlord/messages?tenant=${tenant.id}`}>
                            <Button variant="ghost" size="sm" title="Message Tenant">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </Link>
                          {tenant.agreementId && (
                            <Link href={`/dashboard/landlord/agreements/${tenant.agreementId}`}>
                              <Button variant="ghost" size="sm" title="View Agreement">
                                <FileText className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/dashboard/landlord/tenants/${tenant.id}`}>
                            <Button variant="ghost" size="sm" title="View Profile">
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
