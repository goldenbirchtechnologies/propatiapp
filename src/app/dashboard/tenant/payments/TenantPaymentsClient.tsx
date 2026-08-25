'use client';

import { useState } from 'react';
import { useTransactions, useWallet, useInitiatePayment, usePaymentStatus, usePaymentBreakdown } from '@/hooks/usePayments';
import { useCurrentUser } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2,
  CreditCard,
  Wallet,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

type TabValue = 'overview' | 'invoices' | 'receipts' | 'overdue';

const tabs: { value: TabValue; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'receipts', label: 'Receipts & History' },
  { value: 'overdue', label: 'Overdue (0)' },
];

export default function TenantPaymentsClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [showFilters, setShowFilters] = useState(false);

  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'paystack' | 'wallet'>('paystack');
  const [reference, setReference] = useState<string | null>(null);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);

  const { data: user } = useCurrentUser();
  const { data: transactionsData, isLoading: transactionsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactions({ limit: 20 }) as any;
  const { data: wallet } = useWallet();
  const initiatePaymentMutation = useInitiatePayment();

  const transactions = transactionsData?.pages?.flatMap((page: any) => page.data || []) || [];

  const handlePayRent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    try {
      const result = await initiatePaymentMutation.mutateAsync({
        amount: Number(amount) * 100,
        type: 'rent',
        metadata: { userId },
        listingId: '',
        email: (user as any)?.email || '',
      } as any);
      setReference(result.reference);
      setAuthorizationUrl(result.authorizationUrl);
      window.open(result.authorizationUrl, '_blank');
    } catch {
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const scrollToQuickPayment = () => {
    const el = document.getElementById('quick-payment');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const firstInput = el.querySelector('input, select, button') as HTMLInputElement | null;
      firstInput?.focus();
    }, 300);
  };

  // Mock rent status — replace with real hook when available
  const rentStatus = {
    status: 'up_to_date' as const,
    amount: 0,
    dueDate: '—',
    property: 'No active tenancy linked',
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invoices':
        return (
          <Card>
            <CardContent className="p-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-zinc-400" style={{ opacity: 0.5 }} />
              <p className="font-headline-sm text-white">Your invoice statements will appear here.</p>
            </CardContent>
          </Card>
        );
      case 'receipts':
        return (
          <Card>
            <CardContent className="p-10 text-center">
              <Receipt className="mx-auto mb-3 h-10 w-10 text-zinc-400" style={{ opacity: 0.5 }} />
              <p className="font-headline-sm text-white">Payment receipts will appear here.</p>
            </CardContent>
          </Card>
        );
      case 'overdue':
        return (
          <Card>
            <CardContent className="p-10 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-zinc-400" style={{ opacity: 0.5 }} />
              <p className="font-headline-sm text-white">No overdue payments.</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <>
            {/* Section B: Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 1 — Active Rent / Bill Status */}
              <Card className="border border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-zinc-400">Active Rent / Bill Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-zinc-400 leading-tight">{rentStatus.property}</p>
                      <p className="font-headline-sm text-3xl text-emerald-500 font-bold tracking-tight">
                        ₦{rentStatus.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-zinc-400 leading-tight">Due: {rentStatus.dueDate}</p>
                    </div>
                    {rentStatus.status === 'up_to_date' ? (
                      <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                        🟢 Up to date
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500">
                        🔴 Payment Overdue
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/dashboard/tenant/agreements">View Rent Details</a>
                    </Button>
                    <Button size="sm" onClick={scrollToQuickPayment}>
                      Pay Rent
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2 — Wallet Summary */}
              <Card className="border border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-zinc-400">Wallet Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-zinc-400">Wallet Balance</p>
                      <p className="font-headline-sm text-3xl text-white font-bold tracking-tight">
                        ₦{((wallet?.balance || 0) / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/dashboard/tenant/wallet">Fund Wallet</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/dashboard/tenant/wallet">Withdraw</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section C: Quick Payment */}
            <Card id="quick-payment" className="border border-zinc-800 scroll-mt-6">
              <CardHeader>
                <CardTitle>Quick Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayRent} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Bill / Purpose</Label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice to pay" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Amount</SelectItem>
                          <SelectItem value="rent">Current Rent</SelectItem>
                          <SelectItem value="caution">Caution Deposit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₦)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={purpose === 'rent'}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-lg border border-input bg-transparent p-4 transition-colors',
                          method === 'paystack' ? 'border-emerald-500/50 bg-emerald-500/5' : 'hover:bg-zinc-900/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paystack"
                            checked={method === 'paystack'}
                            onChange={() => setMethod('paystack')}
                            className="h-4 w-4 accent-[var(--accent)]"
                          />
                          <span className="text-sm font-medium">Paystack (Card/Bank/USSD)</span>
                        </div>
                        <CreditCard className="h-4 w-4 text-zinc-400" />
                      </label>
                      <label
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-lg border border-input bg-transparent p-4 transition-colors',
                          method === 'wallet' ? 'border-emerald-500/50 bg-emerald-500/5' : 'hover:bg-zinc-900/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="wallet"
                            checked={method === 'wallet'}
                            onChange={() => setMethod('wallet')}
                            className="h-4 w-4 accent-[var(--accent)]"
                          />
                          <span className="text-sm font-medium">Wallet Balance</span>
                        </div>
                        <Wallet className="h-4 w-4 text-zinc-400" />
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={initiatePaymentMutation.isPending || !amount}
                  >
                    {initiatePaymentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Pay Now'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Section D: Transaction History */}
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-white">Transaction History</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-1 h-4 w-4" /> Filters
              </Button>
            </div>

            {showFilters && (
              <Card className="mb-4">
                <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4">
                  <Input placeholder="From Date" type="date" />
                  <Input placeholder="To Date" type="date" />
                  <select className="inp-field">
                    <option value="">All Types</option>
                    <option value="rent">Rent</option>
                    <option value="caution">Caution Deposit</option>
                    <option value="sale">Sale</option>
                    <option value="short_let">Short Let</option>
                    <option value="subscription">Subscription</option>
                  </select>
                  <select className="inp-field">
                    <option value="">All Status</option>
                    <option value="released">Completed</option>
                    <option value="in_escrow">In Escrow</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <Button variant="outline">Apply</Button>
                </CardContent>
              </Card>
            )}

            <Card className="border border-zinc-800">
              <div className="overflow-x-auto">
                {transactionsLoading && transactions.length === 0 ? (
                  <div className="p-8 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <TransactionRowSkeleton key={i} />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Receipt className="mx-auto mb-3 h-12 w-12 text-zinc-400" style={{ opacity: 0.5 }} />
                    <h3 className="font-headline-sm text-headline-sm mb-2 text-white">No transactions yet</h3>
                    <p className="text-zinc-400" style={{ marginBottom: 'var(--space-lg)' }}>
                      Your completed payment history will appear here.
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left p-4 text-sm font-medium text-zinc-400">Date</th>
                        <th className="text-left p-4 text-sm font-medium text-zinc-400">Type</th>
                        <th className="text-left p-4 text-sm font-medium text-zinc-400">Property</th>
                        <th className="text-right p-4 text-sm font-medium text-zinc-400">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-zinc-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx: any) => (
                        <TransactionRow key={tx.id} transaction={tx} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {(hasNextPage || isFetchingNextPage) && (
                <div className="p-4 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    className="w-full"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      'Load More Transactions'
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Section A: Header & Navigation Tabs (Full Width) */}
      <div>
        <h1 className="font-headline-xl text-white">Rent & Payments</h1>
        <p className="text-zinc-400 mt-1">Manage your rent, payments, and wallet</p>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 border-b border-zinc-800 overflow-x-auto bg-zinc-900/60 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-zinc-900 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Record<string, any> }) {
  const statusConfig = usePaymentStatus(transaction);
  const breakdown = usePaymentBreakdown(transaction);
  const [confirming, setConfirming] = useState(false);
  const needsConfirmation =
    ['in_escrow', 'commission_held', 'pending'].includes(String(transaction.status || '').toLowerCase()) &&
    !transaction.buyerConfirmedAt;

  async function confirmPayment() {
    setConfirming(true);
    try {
      await fetch('/api/transactions/' + transaction.id + '/confirm', { method: 'POST' });
    } catch {
      // empty catch on purpose
    } finally {
      setConfirming(false);
    }
  }

  async function raiseDispute() {
    setConfirming(true);
    try {
      await fetch('/api/transactions/' + transaction.id + '/dispute', { method: 'POST' });
    } catch {
      // empty catch on purpose
    } finally {
      setConfirming(false);
    }
  }

  return (
    <tr className="border-b border-zinc-800">
      <td className="p-4 text-zinc-400">{format(new Date(transaction.createdAt), 'dd MMM yyyy')}</td>
      <td className="p-4">
        <Badge variant="outline" className="capitalize">
          {transaction.type}
        </Badge>
      </td>
      <td className="p-4">
        <p className="font-medium text-white">{transaction.listing?.title || 'N/A'}</p>
        <p className="text-xs text-zinc-400">{transaction.agreement?.id?.slice(-8).toUpperCase()}</p>
      </td>
      <td className="p-4 text-right font-headline-sm text-white">₦{Number(transaction.amount).toLocaleString()}</td>
      <td className="p-4">
        <Badge
          variant={
            statusConfig.color === 'green'
              ? 'success'
              : statusConfig.color === 'blue'
                ? 'secondary'
                : statusConfig.color === 'yellow'
                  ? 'warning'
                  : 'destructive'
          }
          className="capitalize"
        >
          {statusConfig.label}
        </Badge>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {needsConfirmation && (
            <Button size="sm" onClick={confirmPayment} disabled={confirming}>
              Confirm payment
            </Button>
          )}
          <Button variant="ghost" size="icon" title="Dispute" onClick={raiseDispute} disabled={confirming}>
            <AlertCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="View Receipt">
            <Receipt className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function TransactionRowSkeleton() {
  return (
    <tr className="border-b animate-pulse border-zinc-800">
      <td className="p-4">
        <div className="h-4 w-24 bg-zinc-950" />
      </td>
      <td className="p-4">
        <div className="h-6 w-20 rounded bg-zinc-950" />
      </td>
      <td className="p-4">
        <div className="h-4 w-32 bg-zinc-950" />
      </td>
      <td className="p-4 text-right">
        <div className="h-4 w-24 bg-zinc-950" />
      </td>
      <td className="p-4">
        <div className="h-6 w-24 rounded bg-zinc-950" />
      </td>
      <td className="p-4">
        <div className="h-8 w-16 bg-zinc-950" />
      </td>
    </tr>
  );
}
