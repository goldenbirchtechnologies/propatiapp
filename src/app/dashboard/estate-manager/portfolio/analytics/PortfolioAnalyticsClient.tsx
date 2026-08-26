'use client';

import { Building2, Receipt, Wrench, TrendingUp, AlertTriangle, LayoutList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PortfolioAnalyticsClientProps {
  unitsByStatus: Record<string, number>;
  occupancyRate: number;
  totalUnits: number;
  billedServiceCharges: number;
  collectedServiceCharges: number;
  topMaintenanceIssues: {
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
  }[];
  hasRealData: boolean;
  orgName?: string | null;
  avgRent?: number;
  avgServiceCharge?: number;
  avgCautionDeposit?: number;
  expiredLeases?: number;
  listingCount?: number;
}

const statusLabel: Record<string, string> = {
  AVAILABLE: 'Available',
  RENTED: 'Rented',
  MAINTENANCE: 'Maintenance',
  UNAVAILABLE: 'Unavailable',
};

const priorityColors: Record<string, string> = {
  low: 'bg-zinc-900 text-zinc-300 border-white/[0.08]',
  medium: 'bg-zinc-900 text-zinc-300 border-white/[0.08]',
  high: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusColors: Record<string, string> = {
  open: 'bg-zinc-900 text-zinc-300 border-white/[0.08]',
  assigned: 'bg-zinc-900 text-zinc-300 border-white/[0.08]',
  in_progress: 'bg-zinc-900 text-zinc-300 border-white/[0.08]',
  resolved: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20',
  closed: 'bg-zinc-900 text-zinc-300 border-white/[0.08]',
};

export default function PortfolioAnalyticsClient({
  unitsByStatus,
  occupancyRate,
  totalUnits,
  billedServiceCharges,
  collectedServiceCharges,
  topMaintenanceIssues,
  hasRealData,
  orgName,
  avgRent = 0,
  avgServiceCharge = 0,
  avgCautionDeposit = 0,
  expiredLeases = 0,
  listingCount = 0,
}: PortfolioAnalyticsClientProps) {
  const collectionRate = billedServiceCharges > 0 ? Math.round((collectedServiceCharges / billedServiceCharges) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm font-bold text-white">Portfolio Analytics</h1>
          <p className="text-xs font-label-sm uppercase tracking-wider" style={{ color: 'text-zinc-500', marginTop: 'mt-1' }}>
            {hasRealData ? `Portfolio overview for ${orgName || 'your organization'}` : 'Portfolio overview (no organization data available)'}
          </p>
        </div>
        {!hasRealData && (
          <Badge className="bg-amber-500/10 text-zinc-300 border border-amber-500/20 px-3 py-1 text-[10px]">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-zinc-300" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Total Units</p>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{totalUnits}</p>
          <p className="text-xs text-zinc-500 mt-1">{occupancyRate.toFixed(1)}% occupancy</p>
        </div>
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00ff66]" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Occupancy Rate</p>
          </div>
          <p className="text-2xl font-bold text-[#00ff66] font-mono">{occupancyRate.toFixed(1)}%</p>
          <p className="text-xs text-zinc-500 mt-1">{Object.values(unitsByStatus).reduce((a, b) => a + b, 0) || totalUnits} total units</p>
        </div>
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-[#00ff66]" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Billed Service Charges</p>
          </div>
          <p className="text-2xl font-bold text-[#00ff66] font-mono">₦{(billedServiceCharges / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-zinc-500 mt-1">{collectionRate}% collected</p>
        </div>
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-zinc-300" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Collected Service Charges</p>
          </div>
          <p className="text-2xl font-bold text-zinc-300 font-mono">₦{(collectedServiceCharges / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-zinc-500 mt-1">of ₦{(billedServiceCharges / 1e6).toFixed(2)}M billed</p>
        </div>
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00ff66]" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Avg Rent</p>
          </div>
          <p className="text-2xl font-bold text-[#00ff66] font-mono">₦{Math.round(avgRent / 1000)}K</p>
          <p className="text-xs text-zinc-500 mt-1">Occupied units</p>
        </div>
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-zinc-300" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Avg Service Charge</p>
          </div>
          <p className="text-2xl font-bold text-zinc-300 font-mono">₦{Math.round(avgServiceCharge / 1000)}K</p>
          <p className="text-xs text-zinc-500 mt-1">Per unit avg</p>
        </div>
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-zinc-300" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Avg Caution Deposit</p>
          </div>
          <p className="text-2xl font-bold text-zinc-300 font-mono">₦{Math.round(avgCautionDeposit / 1000)}K</p>
          <p className="text-xs text-zinc-500 mt-1">Per unit avg</p>
        </div>
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Expired Leases</p>
          </div>
          <p className="text-2xl font-bold text-red-500 font-mono">{expiredLeases}</p>
          <p className="text-xs text-zinc-500 mt-1">Past end date</p>
        </div>
        <div className="glass-card p-4 border-white/[0.08] bg-zinc-950/50">
          <div className="flex items-center gap-2 mb-2">
            <LayoutList className="w-4 h-4 text-white" />
            <p className="text-xs uppercase tracking-wider text-zinc-500">Listings Linked</p>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{listingCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Active org listings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Units by Status */}
        <div className="glass-card p-6 border-white/[0.08] bg-zinc-950/50">
          <div className="px-6 py-5 border-b border-white/[0.08] p-0 mb-4">
            <h3 className="text-lg font-semibold text-white text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-300" />
              Units by Status
            </h3>
          </div>
          <div className="p-6 p-0">
            <div className="space-y-3">
              {Object.entries(unitsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{statusLabel[status] || status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-zinc-900/10 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-600/60 rounded-full" style={{ width: totalUnits > 0 ? `${(count / totalUnits) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-sm font-mono text-white w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Charge Collection */}
        <div className="glass-card p-6 border-white/[0.08] bg-zinc-950/50">
          <div className="px-6 py-5 border-b border-white/[0.08] p-0 mb-4">
            <h3 className="text-lg font-semibold text-white text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#00ff66]" />
              Service Charge Collection
            </h3>
          </div>
          <div className="p-6 p-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Billed</span>
                <span className="text-sm font-mono text-[#00ff66]">₦{billedServiceCharges.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-zinc-900/10 rounded-full overflow-hidden">
                <div className="h-full bg-success/60 rounded-full" style={{ width: `${collectionRate}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Collected</span>
                <span className="text-sm font-mono text-zinc-300">₦{collectedServiceCharges.toLocaleString()}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">{collectionRate}% collection rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Maintenance Issues */}
      <div className="glass-card border-white/[0.08] bg-zinc-950/50">
        <div className="p-4 border-b border-white/[0.08]">
          <h3 className="font-headline-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-zinc-300" />
            Top Maintenance Issues
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.08] hover:bg-transparent">
                <TableHead className="text-zinc-500">Title</TableHead>
                <TableHead className="text-zinc-500">Category</TableHead>
                <TableHead className="text-zinc-500">Priority</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-zinc-500">Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMaintenanceIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-500 text-sm py-8">
                    No maintenance issues found
                  </TableCell>
                </TableRow>
              ) : (
                topMaintenanceIssues.map((issue) => (
                  <TableRow key={issue.id} className="border-white/[0.08] transition-colors hover:bg-zinc-900est">
                    <TableCell className="text-white text-sm">{issue.title}</TableCell>
                    <TableCell className="text-zinc-300 text-sm capitalize">{issue.category}</TableCell>
                    <TableCell className="text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${priorityColors[issue.priority] || 'bg-zinc-900/10 text-zinc-500 border-white/[0.08]'}`}>
                        {issue.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${statusColors[issue.status] || 'bg-zinc-900/10 text-zinc-500 border-white/[0.08]'}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm">
                      {new Date(issue.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
