'use client';

import { useState } from 'react';
import { useTransactions, useWallet, useInitiatePayment, usePaymentStatus, usePaymentBreakdown } from '@/hooks/usePayments';
import { useCurrentUser } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, Wallet, Receipt, AlertCircle, CheckCircle, Clock, Download, Filter, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export default function TenantPaymentsClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [showFilters, setShowFilters] = useState(false);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);

  const { data: user } = useCurrentUser();
  const { data: transactionsData, isLoading: transactionsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactions({ limit: 20 }) as any;
  const { data: wallet } = useWallet();
  const initiatePaymentMutation = useInitiatePayment();

  const transactions = transactionsData?.pages.flatMap((page: any) => page.data || []) || [];

  const handlePayRent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    try {
      const result = await initiatePaymentMutation.mutateAsync({
        amount: Number(amount) * 100, // Convert to kobo
        type: 'rent',
        metadata: { userId },
      } as any);
      setReference(result.reference);
      setAuthorizationUrl(result.authorizationUrl);
      // In a real app, redirect to Paystack checkout
      window.open(result.authorizationUrl, '_blank');
    } catch (error) {
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Wallet Balance</p>
              <p className="font-heading font-bold text-2xl" style={{ color: 'var(--text)' }}>
                ₦{((wallet?.balance || 0) / 100).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Withdraw
            </Button>
            <Button variant="default" size="sm">
              <CreditCard className="w-4 h-4 mr-2" /> Fund Wallet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pay_rent">Pay Rent</TabsTrigger>
              <TabsTrigger value="caution_deposit">Caution Deposit</TabsTrigger>
              <TabsTrigger value="service_charge">Service Charge</TabsTrigger>
            </TabsList>

            <TabsContent value="pay_rent" className="mt-4">
              <form onSubmit={handlePayRent} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="inp-label">Amount (₦)</label>
                  <Input
                    type="number"
                    placeholder="Enter rent amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  You will be redirected to Paystack to complete the payment securely.
                </p>
                <Button type="submit" className="w-full" disabled={initiatePaymentMutation.isPending || !amount}>
                  {initiatePaymentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Pay Rent Now'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="caution_deposit" className="mt-4">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Pay caution deposit for a new agreement.</p>
              <Button variant="outline" className="mt-2">Pay Caution Deposit</Button>
            </TabsContent>

            <TabsContent value="service_charge" className="mt-4">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Pay monthly service charges.</p>
              <Button variant="outline" className="mt-2">Pay Service Charge</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transactions */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Transaction History</h2>
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-1" /> Filters
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

      <Card>
        <div className="overflow-x-auto">
          {transactionsLoading && transactions.length === 0 ? (
            <div className="p-8">
              {[...Array(5)].map((_, i) => <TransactionRowSkeleton key={i} />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
              <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No transactions yet</h3>
              <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>Your payment history will appear here.</p>
              <Button variant="default"><CreditCard className="w-4 h-4 mr-2" /> Make a Payment</Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
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
          <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              className="w-full"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading more...
                </>
              ) : (
                'Load More Transactions'
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: any }) {
  const statusConfig = usePaymentStatus(transaction);
  const breakdown = usePaymentBreakdown(transaction);

  return (
    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
      <td className="p-4" style={{ color: 'var(--muted)' }}>
        {format(new Date(transaction.createdAt), 'dd MMM yyyy')}
      </td>
      <td className="p-4">
        <Badge variant="outline" className="capitalize">{transaction.type}</Badge>
      </td>
      <td className="p-4">
        <p className="font-medium" style={{ color: 'var(--text)' }}>{transaction.listing?.title || 'N/A'}</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{transaction.agreement?.id?.slice(-8).toUpperCase()}</p>
      </td>
      <td className="p-4 text-right font-heading font-bold" style={{ color: 'var(--text)' }}>
        ₦{Number(transaction.amount).toLocaleString()}
      </td>
      <td className="p-4">
        <Badge variant={statusConfig.color === 'green' ? 'success' : statusConfig.color === 'blue' ? 'secondary' : statusConfig.color === 'yellow' ? 'warning' : 'destructive'} className="capitalize">
          {statusConfig.label}
        </Badge>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="View Receipt">
            <Receipt className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" title="View Details">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function TransactionRowSkeleton() {
  return (
    <tr className="border-b animate-pulse" style={{ borderColor: 'var(--border)' }}>
      <td className="p-4"><div className="h-4 w-24" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-6 w-20 rounded" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-4 w-32" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4 text-right"><div className="h-4 w-24" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-6 w-24 rounded" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-8 w-16" style={{ background: 'var(--border)' }} /></td>
    </tr>
  );
}