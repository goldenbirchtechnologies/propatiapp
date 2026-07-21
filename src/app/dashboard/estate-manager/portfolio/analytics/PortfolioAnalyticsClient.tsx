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
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusColors: Record<string, string> = {
  open: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  assigned: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
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
          <h1 className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Portfolio Analytics</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>
            {hasRealData ? `Portfolio overview for ${orgName || 'your organization'}` : 'Portfolio overview (no organization data available)'}
          </p>
        </div>
        {!hasRealData && (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 text-[10px]">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Total Units</p>
          </div>
          <p className="text-2xl font-bold text-on-surface font-mono">{totalUnits}</p>
          <p className="text-xs text-zinc-400 mt-1">{occupancyRate.toFixed(1)}% occupancy</p>
        </Card>
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Occupancy Rate</p>
          </div>
          <p className="text-2xl font-bold text-green-400 font-mono">{occupancyRate.toFixed(1)}%</p>
          <p className="text-xs text-zinc-400 mt-1">{Object.values(unitsByStatus).reduce((a, b) => a + b, 0) || totalUnits} total units</p>
        </Card>
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-success" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Billed Service Charges</p>
          </div>
          <p className="text-2xl font-bold text-success font-mono">₦{(billedServiceCharges / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-zinc-400 mt-1">{collectionRate}% collected</p>
        </Card>
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Collected Service Charges</p>
          </div>
          <p className="text-2xl font-bold text-blue-400 font-mono">₦{(collectedServiceCharges / 1e6).toFixed(2)}M</p>
          <p className="text-xs text-zinc-400 mt-1">of ₦{(billedServiceCharges / 1e6).toFixed(2)}M billed</p>
        </Card>
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Avg Rent</p>
          </div>
          <p className="text-2xl font-bold text-success font-mono">₦{Math.round(avgRent / 1000)}K</p>
          <p className="text-xs text-zinc-400 mt-1">Occupied units</p>
        </Card>
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Avg Service Charge</p>
          </div>
          <p className="text-2xl font-bold text-blue-400 font-mono">₦{Math.round(avgServiceCharge / 1000)}K</p>
          <p className="text-xs text-zinc-400 mt-1">Per unit avg</p>
        </Card>
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Avg Caution Deposit</p>
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">₦{Math.round(avgCautionDeposit / 1000)}K</p>
          <p className="text-xs text-zinc-400 mt-1">Per unit avg</p>
        </Card>
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Expired Leases</p>
          </div>
          <p className="text-2xl font-bold text-destructive font-mono">{expiredLeases}</p>
          <p className="text-xs text-zinc-400 mt-1">Past end date</p>
        </Card>
        <Card className="p-4 border-outline bg-surface-container-low">
          <div className="flex items-center gap-2 mb-2">
            <LayoutList className="w-4 h-4 text-primary" />
            <p className="text-xs uppercase tracking-wider text-zinc-400">Listings Linked</p>
          </div>
          <p className="text-2xl font-bold text-primary font-mono">{listingCount}</p>
          <p className="text-xs text-zinc-400 mt-1">Active org listings</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Units by Status */}
        <Card className="p-6 border-outline bg-surface-container-low">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Units by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              {Object.entries(unitsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{statusLabel[status] || status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-outline/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500/60 rounded-full" style={{ width: totalUnits > 0 ? `${(count / totalUnits) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-sm font-mono text-on-surface w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Charge Collection */}
        <Card className="p-6 border-outline bg-surface-container-low">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-on-surface flex items-center gap-2">
              <Receipt className="w-4 h-4 text-green-400" />
              Service Charge Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Billed</span>
                <span className="text-sm font-mono text-success">₦{billedServiceCharges.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-outline/5 rounded-full overflow-hidden">
                <div className="h-full bg-success/60 rounded-full" style={{ width: `${collectionRate}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Collected</span>
                <span className="text-sm font-mono text-blue-400">₦{collectedServiceCharges.toLocaleString()}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">{collectionRate}% collection rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Maintenance Issues */}
      <Card className="border-outline bg-surface-container-low">
        <div className="p-4 border-b border-outline">
          <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            Top Maintenance Issues
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-outline hover:bg-transparent">
                <TableHead className="text-zinc-400">Title</TableHead>
                <TableHead className="text-zinc-400">Category</TableHead>
                <TableHead className="text-zinc-400">Priority</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMaintenanceIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-400 text-sm py-8">
                    No maintenance issues found
                  </TableCell>
                </TableRow>
              ) : (
                topMaintenanceIssues.map((issue) => (
                  <TableRow key={issue.id} className="border-outline transition-colors hover:bg-surface-container-lowest">
                    <TableCell className="text-on-surface text-sm">{issue.title}</TableCell>
                    <TableCell className="text-zinc-300 text-sm capitalize">{issue.category}</TableCell>
                    <TableCell className="text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${priorityColors[issue.priority] || 'bg-outline/5 text-zinc-400 border-outline'}`}>
                        {issue.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${statusColors[issue.status] || 'bg-outline/5 text-zinc-400 border-outline'}`}>
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
      </Card>
    </div>
  );
}
