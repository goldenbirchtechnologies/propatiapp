'use client';

import { Building2, Receipt, Wrench, TrendingUp, AlertTriangle, LayoutList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  low: 'bg-[#262626] text-neutral-300 border-[#262626]',
  medium: 'bg-[#262626] text-neutral-300 border-[#262626]',
  high: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusColors: Record<string, string> = {
  open: 'bg-[#262626] text-neutral-300 border-[#262626]',
  assigned: 'bg-[#262626] text-neutral-300 border-[#262626]',
  in_progress: 'bg-[#262626] text-neutral-300 border-[#262626]',
  resolved: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20',
  closed: 'bg-[#262626] text-neutral-300 border-[#262626]',
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
          <h1 className="font-headline-sm font-bold" className="text-white">Portfolio Analytics</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>
            {hasRealData ? `Portfolio overview for ${orgName || 'your organization'}` : 'Portfolio overview (no organization data available)'}
          </p>
        </div>
        {!hasRealData && (
          <Badge className="bg-amber-500/10 text-neutral-300 border border-amber-500/20 px-3 py-1 text-[10px]">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-neutral-300" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Total Units</p>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{totalUnits}</p>
          <p className="text-xs text-neutral-400 mt-1">{occupancyRate.toFixed(1)}% occupancy</p>
        </div>
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00ff66]" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Occupancy Rate</p>
          </div>
          <p className="text-2xl font-bold text-[#00ff66] font-mono">{occupancyRate.toFixed(1)}%</p>
          <p className="text-xs text-neutral-400 mt-1">{Object.values(unitsByStatus).reduce((a, b) => a + b, 0) || totalUnits} total units</p>
        </div>
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-[#00ff66]" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Billed Service Charges</p>
          </div>
          <p className="text-2xl font-bold text-[#00ff66] font-mono">₦{(billedServiceCharges / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-neutral-400 mt-1">{collectionRate}% collected</p>
        </div>
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-neutral-300" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Collected Service Charges</p>
          </div>
          <p className="text-2xl font-bold text-neutral-300 font-mono">₦{(collectedServiceCharges / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-neutral-400 mt-1">of ₦{(billedServiceCharges / 1e6).toFixed(2)}M billed</p>
        </div>
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00ff66]" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Avg Rent</p>
          </div>
          <p className="text-2xl font-bold text-[#00ff66] font-mono">₦{Math.round(avgRent / 1000)}K</p>
          <p className="text-xs text-neutral-400 mt-1">Occupied units</p>
        </div>
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-neutral-300" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Avg Service Charge</p>
          </div>
          <p className="text-2xl font-bold text-neutral-300 font-mono">₦{Math.round(avgServiceCharge / 1000)}K</p>
          <p className="text-xs text-neutral-400 mt-1">Per unit avg</p>
        </div>
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-neutral-300" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Avg Caution Deposit</p>
          </div>
          <p className="text-2xl font-bold text-neutral-300 font-mono">₦{Math.round(avgCautionDeposit / 1000)}K</p>
          <p className="text-xs text-neutral-400 mt-1">Per unit avg</p>
        </div>
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Expired Leases</p>
          </div>
          <p className="text-2xl font-bold text-red-500 font-mono">{expiredLeases}</p>
          <p className="text-xs text-neutral-400 mt-1">Past end date</p>
        </div>
        <Card className="p-4 border-[#262626] bg-obsidian-800/30">
          <div className="flex items-center gap-2 mb-2">
            <LayoutList className="w-4 h-4 text-white" />
            <p className="text-xs uppercase tracking-wider text-neutral-400">Listings Linked</p>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{listingCount}</p>
          <p className="text-xs text-neutral-400 mt-1">Active org listings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Units by Status */}
        <Card className="p-6 border-[#262626] bg-obsidian-800/30">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-neutral-300" />
              Units by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              {Object.entries(unitsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">{statusLabel[status] || status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-[#262626]/10 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-600/60 rounded-full" style={{ width: totalUnits > 0 ? `${(count / totalUnits) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-sm font-mono text-white w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>

        {/* Service Charge Collection */}
        <Card className="p-6 border-[#262626] bg-obsidian-800/30">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#00ff66]" />
              Service Charge Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Billed</span>
                <span className="text-sm font-mono text-[#00ff66]">₦{billedServiceCharges.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-[#262626]/10 rounded-full overflow-hidden">
                <div className="h-full bg-success/60 rounded-full" style={{ width: `${collectionRate}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Collected</span>
                <span className="text-sm font-mono text-neutral-300">₦{collectedServiceCharges.toLocaleString()}</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2">{collectionRate}% collection rate</p>
            </div>
          </CardContent>
        </div>
      </div>

      {/* Top Maintenance Issues */}
      <Card className="border-[#262626] bg-obsidian-800/30">
        <div className="p-4 border-b border-[#262626]">
          <h3 className="font-headline-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-neutral-300" />
            Top Maintenance Issues
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#262626] hover:bg-transparent">
                <TableHead className="text-neutral-400">Title</TableHead>
                <TableHead className="text-neutral-400">Category</TableHead>
                <TableHead className="text-neutral-400">Priority</TableHead>
                <TableHead className="text-neutral-400">Status</TableHead>
                <TableHead className="text-neutral-400">Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMaintenanceIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-neutral-400 text-sm py-8">
                    No maintenance issues found
                  </TableCell>
                </TableRow>
              ) : (
                topMaintenanceIssues.map((issue) => (
                  <TableRow key={issue.id} className="border-[#262626] transition-colors hover:bg-obsidian-800-lowestest">
                    <TableCell className="text-white text-sm">{issue.title}</TableCell>
                    <TableCell className="text-neutral-300 text-sm capitalize">{issue.category}</TableCell>
                    <TableCell className="text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${priorityColors[issue.priority] || 'bg-[#262626]/10 text-neutral-400 border-[#262626]'}`}>
                        {issue.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${statusColors[issue.status] || 'bg-[#262626]/10 text-neutral-400 border-[#262626]'}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-neutral-300 text-sm">
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
