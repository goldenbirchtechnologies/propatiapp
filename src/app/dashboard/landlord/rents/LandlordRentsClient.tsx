'use client'

import AppIcon from '@/components/icons/app-icon';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardSection } from '@/components/layout/DashboardShell';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {

  DollarSign as CurrencyIcon,
  Shield as ShieldIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Eye as EyeIcon,
  FileText as FileIcon,
  Download,
  SlidersHorizontal,
  Wallet,
  BadgeCheck,
} from 'lucide-react';

type Transaction = {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  listing?: { title: string; area?: string };
  payer?: { fullName: string };
  payeeId: string;
  agreements?: { tenant?: { fullName: string } }[];
};

interface LandlordRentsClientProps {
  userId: string;
}

export default function LandlordRentsClient({ userId }: LandlordRentsClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/transactions?userId=${userId}&page=1&limit=50`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load transactions');
      const json = await res.json();
      const data: Transaction[] = (json?.data || []).filter((t) => t.payeeId === userId);
      setTransactions(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  // Stats
  const totalRevenue = transactions
    .filter((t) => t.status === 'released')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const inEscrow = transactions
    .filter((t) => t.status === 'in_escrow')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const thisMonthRevenue = transactions
    .filter((t) => t.status === 'released' && new Date(t.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const trendPositive = totalRevenue > 0;
  const monthPercent =
    totalRevenue - thisMonthRevenue > 0
      ? ((thisMonthRevenue / (totalRevenue - thisMonthRevenue)) * 100).toFixed(0)
      : '0';

  // Mock chart data for reference design
  const monthlyRevenue = [60, 75, 45, 90, 65, 80]; // percentages

  function RentTableSkeleton() {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant">
              {['Tenant Name', 'Property Unit', 'Amount', 'Date', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-outline-variant">
                <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="p-4"><Skeleton className="h-8 w-8 rounded-full" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1
            className="font-headline-sm text-headline-sm font-bold text-primary text-3xl md:text-4xl text-primary">
            Rent Collection
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage property yields and track tenant payment compliance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Bento Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Revenue Card - Large dark card */}
        <Card className="md:col-span-2 relative overflow-hidden" style={{ background: 'hsl(var(--primary-dark))' }}>
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-medium uppercase tracking-widest text-on-primary/60 mb-2">
              Total Expected Revenue
            </p>
            <p className="text-4xl font-headline-sm text-headline-sm font-bold text-primary text-on-primary mb-4">₦14,250,000</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-success-bright">
                <AppIcon name="trending_up" className="lucide" />
                <span className="text-xs font-medium">12% vs last month</span>
              </div>
              <div className="bg-surface-container-lowest/10 px-3 py-1 rounded-full text-xs font-bold text-white">
                Fiscal Year 2024
              </div>
            </div>
          </CardContent>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-surface-container-lowest/10 rounded-full opacity-20" />
        </Card>

        {/* Collected Funds */}
        <Card className="border-t-4" style={{ borderTopColor: 'hsl(var(--tertiary))' }}>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Collected Funds</p>
            <p className="text-2xl font-headline-sm text-headline-sm font-bold text-primary" style={{ color: 'hsl(var(--tertiary))' }}>₦11,800,000</p>
            <div className="mt-4">
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-success h-full w-[82%] rounded-full" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">82% of target reached</p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Arrears */}
        <Card className="border-t-4 border-destructive">
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Pending Arrears</p>
            <p className="text-2xl font-headline-sm text-headline-sm font-bold text-primary text-destructive">₦2,450,000</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">14 Units Overdue</span>
              <AppIcon name="warning" className="lucide" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rent Payments Table */}
      <DashboardSection loading={loading} error={error} onRetry={load} skeleton={<RentTableSkeleton />}>
        {transactions.length === 0 ? (
          <Card className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center shadow-sm hover:shadow-md transition-shadow">
            <CurrencyIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">No transactions yet</h3>
            <p className="text-muted-foreground">Rent payments will appear here once tenants start paying.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">Recent Rent Payments</h3>
              <p className="text-xs text-muted-foreground">Showing {Math.min(transactions.length, 8)} of {transactions.length} transactions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 text-left font-medium">Tenant Name</th>
                    <th className="px-6 py-4 text-left font-medium">Property Unit</th>
                    <th className="px-6 py-4 text-left font-medium">Amount</th>
                    <th className="px-6 py-4 text-left font-medium">Date</th>
                    <th className="px-6 py-4 text-left font-medium">Status</th>
                    <th className="px-6 py-4 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.slice(0, 8).map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold">
                            {(tx.payer?.fullName || tx.agreements?.tenant?.fullName || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.payer?.fullName || tx.agreements?.tenant?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground opacity-70">{tx.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{tx.listing?.title || tx.listing?.area || '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium font-mono">₦{Number(tx.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <RentStatusBadge status={tx.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="lucide text-muted-foreground hover:text-primary transition-colors" aria-label="More options">more_vert</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </DashboardSection>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-headline-sm text-headline-sm font-semibold text-primary">Revenue Distribution</h4>
                <p className="text-xs text-muted-foreground">Monthly collection performance</p>
              </div>
              <AppIcon name="info" className="lucide" />
            </div>
            <div className="h-64 flex items-end justify-between gap-3">
              {monthlyRevenue.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary-container rounded-t-lg transition-all duration-700 hover:brightness-125"
                    style={{ height: `${val}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Verified Action */}
        <Card className="relative overflow-hidden" style={{ background: 'hsl(var(--primary-dark))' }}>
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
            <div>
              <h4 className="font-headline-sm text-headline-sm font-semibold text-primary text-on-primary mb-2">Quick Verified Action</h4>
              <p className="text-sm text-on-primary/80 mb-6">
                You have ₦4,200,000 available for withdrawal to your verified corporate account. Transactions are settled within 15 minutes.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-surface-container-lowest/10 p-3 rounded-lg border border-outline-variant">
                  <BadgeCheck className="h-5 w-5 text-on-primary" />
                  <div>
                    <p className="text-sm font-medium text-on-primary">Verified Bank Account</p>
                    <p className="text-xs text-on-primary/60">Guaranty Trust Bank •••• 4291</p>
                  </div>
                </div>
              </div>
            </div>
            <Button className="mt-6 w-full bg-warning text-foreground hover:bg-warning font-bold">
              <Wallet className="h-4 w-4" />
              Request Instant Payout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    released: { className: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Paid' },
    in_escrow: { className: 'bg-accent/20 text-accent border-accent/30', label: 'In Escrow' },
    pending: { className: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
    failed: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Failed' },
    refunded: { className: 'bg-warning/10 text-warning border-warning/30', label: 'Refunded' },
  };
  const cfg = config[status] || { className: 'bg-surface-container-low text-on-surface-variant border-outline-variant', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${cfg.className}`}>
      {status === 'released' && <span className="lucide text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
      {status === 'pending' && <span className="lucide text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>}
      {status === 'in_escrow' && <span className="lucide text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>}
      {cfg.label}
    </span>
  );
}
