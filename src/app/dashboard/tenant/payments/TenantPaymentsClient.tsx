'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Eye, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, StatCard, StatusBadge, Avatar } from '@/components/ui';

type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';
type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'cheque';
type PaymentType = 'rent' | 'caution' | 'sale' | 'short_let' | 'subscription';

interface Payment {
  id: string;
  transactionId: string;
  listing: {
    title: string;
    area: string;
  };
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  type: PaymentType;
  paidAt: string | null;
  createdAt: string;
  payee: {
    fullName: string;
    email: string;
  };
}

interface Props {
  userId: string;
}

export default function TenantPaymentsClient({ userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 20;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/payments/transactions?userId=${encodeURIComponent(userId)}&page=${currentPage}&limit=${pageSize}`);
        if (!res.ok) {
          console.error('Failed to fetch transactions');
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        setPayments(json?.data ?? []);
        setTotalPages(json?.totalPages ?? 1);
      } catch (e) {
        console.error('Error loading payments', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, currentPage]);

  const filtered = payments;

  const successCount = filtered.filter((p) => p.status === 'success').length;
  const totalPaid = filtered
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingCount = filtered.filter((p) => p.status === 'pending').length;
  const averagePayment = successCount > 0 ? totalPaid / successCount : 0;

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatShort = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  function paymentStatusBadge(status: PaymentStatus) {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
            Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
            Refunded
          </span>
        );
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rent Payments"
        description="View and manage your rent payment history"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Paid"
          value={formatShort(totalPaid)}
          icon={<CreditCard className="w-5 h-5" />}
          trend="All time"
          trendPositive
        />
        <StatCard
          label="Successful"
          value={String(successCount)}
          icon={<CreditCard className="w-5 h-5" />}
          trend="Completed"
          trendPositive
        />
        <StatCard
          label="Pending"
          value={String(pendingCount)}
          icon={<CreditCard className="w-5 h-5" />}
          trend="Awaiting"
          trendPositive={pendingCount === 0}
        />
        <StatCard
          label="Average"
          value={formatShort(averagePayment)}
          icon={<CreditCard className="w-5 h-5" />}
          trend="Per payment"
          trendPositive
        />
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[220px]">
            <Download className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search payments..."
              className="pl-10 bg-zinc-950 border-zinc-800 text-white"
              disabled
            />
          </div>
          <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400">
            <CreditCard className="h-4 w-4 mr-2" /> All Methods
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="glass-card border-zinc-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="inline-flex items-center gap-2 text-zinc-400">
                        <Download className="h-4 w-4 animate-spin" /> Loading...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                      No payments match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((payment) => (
                    <tr key={payment.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{payment.listing.title}</p>
                        <p className="text-xs text-zinc-500">{payment.listing.area}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {formatCurrency(Number(payment.amount))}
                      </td>
                      <td className="px-4 py-3">
                        {paymentStatusBadge(payment.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/tenant/payments/${payment.id}`}>
                          <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrevious}
              className="border-zinc-800 text-zinc-400 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              className="border-zinc-800 text-zinc-400 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
