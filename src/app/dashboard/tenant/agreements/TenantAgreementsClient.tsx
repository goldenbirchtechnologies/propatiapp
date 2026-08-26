'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Eye, Search, Filter, Calendar, Home, User, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, StatCard, Avatar, StatusBadge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Agreement {
  id: string;
  title: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
  landlord: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  property: {
    title: string;
    address: string;
    area: string;
    images: { url: string }[];
  };
  rentAmount: number;
  depositAmount: number;
  createdAt: string;
  signedAt?: string;
}

export default function TenantAgreementsClient({ agreements }: { agreements: Agreement[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = agreements.filter((agreement) => {
    const matchesSearch =
      !searchQuery ||
      agreement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agreement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = agreements.filter((a) => a.status === 'active').length;
  const pendingCount = agreements.filter((a) => a.status === 'pending' || a.status === 'draft').length;
  const expiredCount = agreements.filter((a) => a.status === 'expired' || a.status === 'terminated').length;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });

  const getLeaseStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progress = total > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))) : 0;
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return { progress, daysLeft };
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Lease Agreements"
        description="View and manage your active and past lease agreements"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active" value={String(activeCount)} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Pending" value={String(pendingCount)} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Expired" value={String(expiredCount)} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Total" value={String(agreements.length)} icon={<FileText className="w-5 h-5" />} />
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search agreements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-950 border-white/[0.08] text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-zinc-950 border-white/[0.08] text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card glass-card">
          <div className="p-6 py-16 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
            <h3 className="text-xl font-semibold text-white mb-2">No agreements found</h3>
            <p className="text-zinc-400">You don&apos;t have any lease agreements yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((agreement) => {
            const lease = getLeaseStatus(agreement.startDate, agreement.endDate);
            const isActive = agreement.status === 'active';
            const image = agreement.property.images[0]?.url || '/placeholder-property.png';

            return (
              <div className="glass-card" key={agreement.id} className="glass-card">
                <div className="px-6 py-5 border-b border-white/[0.08] pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white text-base font-semibold text-white">{agreement.title}</h3>
                        <p className="text-sm text-zinc-500">{agreement.property.address}, {agreement.property.area}</p>
                      </div>
                    </div>
                    <StatusBadge status={agreement.status} />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900">
                    <img src={image} alt={agreement.property.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-zinc-600">Monthly Rent</p>
                      <p className="text-sm font-semibold text-white">{formatCurrency(agreement.rentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600">Deposit</p>
                      <p className="text-sm font-semibold text-white">{formatCurrency(agreement.depositAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600">Start Date</p>
                      <p className="text-sm text-white">{formatDate(agreement.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600">End Date</p>
                      <p className="text-sm text-white">{formatDate(agreement.endDate)}</p>
                    </div>
                  </div>
                  {isActive && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500">Lease Progress</span>
                        <span className="text-white">{lease.progress}% complete</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${lease.progress}%` }} />
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{lease.daysLeft} days remaining</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                    <Avatar
                      src={agreement.landlord?.avatarUrl || undefined}
                      name={agreement.landlord?.fullName || 'L'}
                      size="sm"
                    />
                    <div className="flex gap-2">
                      <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Link href={`/dashboard/tenant/agreements/${agreement.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
